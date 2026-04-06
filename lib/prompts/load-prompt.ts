import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

function extractPrompt(markdown: string) {
  const match = markdown.match(/```(?:text)?\n([\s\S]*?)```/);
  if (match?.[1]) {
    return match[1].trim();
  }

  return markdown.trim();
}

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

/** Read raw markdown (not extracted) for editing UI */
export function loadPromptRaw(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "prompts", normalized);
  return fs.readFileSync(absolutePath, "utf8");
}

/** Save prompt markdown to disk and invalidate cache */
export function savePrompt(relativePath: string, content: string): void {
  const normalized = relativePath.replace(/^\/+/, "");
  /* Prevent directory traversal */
  if (normalized.includes("..")) throw new Error("Invalid path");

  const absolutePath = path.join(process.cwd(), "prompts", normalized);
  fs.writeFileSync(absolutePath, content, "utf8");
  /* Invalidate cache so next loadPrompt picks up the change */
  cache.delete(normalized);
}

/** List all prompt files recursively */
export function listPromptFiles(): { path: string; type: "agent" | "specialist" | "skill" | "policy" | "other"; name: string }[] {
  const promptsDir = path.join(process.cwd(), "prompts");
  const results: { path: string; type: "agent" | "specialist" | "skill" | "policy" | "other"; name: string }[] = [];

  function walk(dir: string, prefix: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        let type: "agent" | "specialist" | "skill" | "policy" | "other" = "other";
        if (relativePath.startsWith("specialists/")) type = "specialist";
        else if (relativePath.startsWith("skills/")) type = "skill";
        else if (relativePath.startsWith("policies/")) type = "policy";
        else if (relativePath === "master-agent.md") type = "agent";

        const name = entry.name
          .replace(".md", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        results.push({ path: relativePath, type, name });
      }
    }
  }

  walk(promptsDir, "");
  return results;
}
