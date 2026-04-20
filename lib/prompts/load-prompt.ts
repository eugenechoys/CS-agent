import fs from "node:fs";
import path from "node:path";
import { dbGet, dbSave, dbDelete, dbListAll, dbLoadAll } from "@/lib/db/prompts-store";
import { getPool } from "@/lib/db/client";

const cache = new Map<string, string>();

let dbCacheWarmed = false;
let dbCacheWarmingPromise: Promise<void> | null = null;

function extractPrompt(markdown: string) {
  const match = markdown.match(/```(?:text)?\n([\s\S]*?)```/);
  if (match?.[1]) {
    return match[1].trim();
  }
  return markdown.trim();
}

/**
 * Pre-warm the in-memory prompt cache from DB. Call this once per process
 * before running any agent so DB-edited prompts are visible to sync loadPrompt().
 */
export async function ensureDBCacheWarmed(): Promise<void> {
  if (dbCacheWarmed || !getPool()) return;
  if (dbCacheWarmingPromise) return dbCacheWarmingPromise;

  dbCacheWarmingPromise = (async () => {
    try {
      const rows = await dbLoadAll();
      for (const row of rows) {
        cache.set(row.path, extractPrompt(row.content));
      }
      dbCacheWarmed = true;
    } catch (e) {
      console.error("[prompts] Failed to warm cache from DB:", e);
    }
  })();

  return dbCacheWarmingPromise;
}

/** Sync load — reads from in-memory cache first, then filesystem. Always call
 *  ensureDBCacheWarmed() before agent runs so DB edits are reflected here. */
export function loadPrompt(relativePath: string) {
  const normalized = relativePath.replace(/^\/+/, "");

  if (cache.has(normalized)) {
    return cache.get(normalized)!;
  }

  const absolutePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "prompts",
    normalized,
  );
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const prompt = extractPrompt(markdown);

  cache.set(normalized, prompt);
  return prompt;
}

/** Read raw markdown for the editing UI — DB takes precedence over filesystem */
export async function loadPromptRaw(relativePath: string): Promise<string> {
  const normalized = relativePath.replace(/^\/+/, "");

  const dbContent = await dbGet(normalized);
  if (dbContent !== null) return dbContent;

  const absolutePath = path.join(process.cwd(), "prompts", normalized);
  return fs.readFileSync(absolutePath, "utf8");
}

/** Save prompt. Writes to DB in production (DATABASE_URL set), filesystem in dev. */
export async function savePrompt(relativePath: string, content: string): Promise<void> {
  const normalized = relativePath.replace(/^\/+/, "");
  if (normalized.includes("..")) throw new Error("Invalid path");

  if (getPool()) {
    await dbSave(normalized, content);
  } else {
    const absolutePath = path.join(process.cwd(), "prompts", normalized);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absolutePath, content, "utf8");
  }

  cache.set(normalized, extractPrompt(content));
}

/** Delete a prompt. Removes from DB in production, filesystem in dev. */
export async function deletePrompt(relativePath: string): Promise<void> {
  const normalized = relativePath.replace(/^\/+/, "");
  if (normalized.includes("..")) throw new Error("Invalid path");

  if (getPool()) {
    await dbDelete(normalized);
  } else {
    const absolutePath = path.join(process.cwd(), "prompts", normalized);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  cache.delete(normalized);
}

/** Load all .md files from a prompts subdirectory and concatenate with section headers */
export function loadAllKnowledgeFiles(subdir: string): string {
  const dir = path.join(process.cwd(), "prompts", subdir);
  if (!fs.existsSync(dir)) return "";

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  return files
    .map((file) => {
      const name = file.replace(".md", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const content = loadPrompt(`${subdir}/${file}`);
      return `## ${name}\n\n${content}`;
    })
    .join("\n\n---\n\n");
}

/** List all prompt files — filesystem base merged with DB-only entries */
export async function listPromptFiles(): Promise<{ path: string; type: "agent" | "specialist" | "skill" | "policy" | "other"; name: string; inDB?: boolean }[]> {
  const fsFiles = listPromptFilesSync();
  const fsPathSet = new Set(fsFiles.map((f) => f.path));

  const dbEntries = await dbListAll();
  const dbOnlyEntries = dbEntries
    .filter((d) => !fsPathSet.has(d.path))
    .map((d) => {
      const fileName = d.path.split("/").pop() ?? d.path;
      return {
        path: d.path,
        type: classifyPath(d.path),
        name: fileName.replace(".md", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        inDB: true,
      };
    });

  const merged = [
    ...fsFiles.map((f) => ({ ...f, inDB: dbEntries.some((d) => d.path === f.path) })),
    ...dbOnlyEntries,
  ];

  return merged;
}

function classifyPath(filePath: string): "agent" | "specialist" | "skill" | "policy" | "other" {
  if (filePath.startsWith("specialists/")) return "specialist";
  if (filePath.startsWith("skills/")) return "skill";
  if (filePath.startsWith("policies/")) return "policy";
  if (filePath === "master-agent.md") return "agent";
  return "other";
}

/** Sync version for internal use only — filesystem only */
export function listPromptFilesSync(): { path: string; type: "agent" | "specialist" | "skill" | "policy" | "other"; name: string }[] {
  const promptsDir = path.join(process.cwd(), "prompts");
  const results: { path: string; type: "agent" | "specialist" | "skill" | "policy" | "other"; name: string }[] = [];

  function walk(dir: string, prefix: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const name = entry.name
          .replace(".md", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        results.push({ path: relativePath, type: classifyPath(relativePath), name });
      }
    }
  }

  walk(promptsDir, "");
  return results;
}
