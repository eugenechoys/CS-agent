import { z } from "zod";
import {
  loadPromptRaw,
  savePrompt,
  deletePrompt,
  listPromptFiles,
} from "@/lib/prompts/load-prompt";

const READ_WRITE_PREFIXES = ["cs-general/", "cs-modes/", "cs-specific/", "cs-policies/"];

function isAllowedPath(filePath: string) {
  return READ_WRITE_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

/**
 * Creates the knowledge-management tools for the AI Trainer agent.
 * These let the LLM read, edit, add, and delete content in the CS knowledge files.
 */
export async function createTrainerTools() {
  const { tool } = (await import("@openai/agents")) as any;

  const listKnowledgeFiles = tool({
    name: "list_knowledge_files",
    description:
      "List all CS knowledge and policy files. Returns file paths and names. Use this to understand what files exist before deciding where to add or edit content.",
    parameters: z.object({}),
    execute: async () => {
      const allFiles = await listPromptFiles();
      const csFiles = allFiles.filter((f: any) => isAllowedPath(f.path));
      return JSON.stringify(csFiles, null, 2);
    },
  });

  const readKnowledgeFile = tool({
    name: "read_knowledge_file",
    description:
      "Read the full content of a CS knowledge or mode prompt file before making edits.",
    parameters: z.object({
      file_path: z
        .string()
        .describe("The relative path of the file, e.g. 'cs-general/faq.md' or 'cs-modes/hr-expert/agent.md'"),
    }),
    execute: async ({ file_path }: { file_path: string }) => {
      if (!isAllowedPath(file_path)) {
        return JSON.stringify({ error: "Can only access CS prompt directories." });
      }
      try {
        const content = await loadPromptRaw(file_path);
        return JSON.stringify({ file_path, content });
      } catch {
        return JSON.stringify({ error: `File not found: ${file_path}` });
      }
    },
  });

  const updateKnowledgeFile = tool({
    name: "update_knowledge_file",
    description:
      "Write new content to a knowledge file. This REPLACES the entire file content. Always read the file first, make your changes, then write the full updated content back. Use this for adding new info, editing existing info, or removing sections.",
    parameters: z.object({
      file_path: z
        .string()
        .describe("The relative path of the file, e.g. 'cs-general/faq.md'"),
      content: z.string().describe("The full new content for the file (replaces everything)."),
      change_summary: z
        .string()
        .describe("A short summary of what was changed, for the user to review."),
    }),
    execute: async ({
      file_path,
      content,
      change_summary,
    }: {
      file_path: string;
      content: string;
      change_summary: string;
    }) => {
      if (!isAllowedPath(file_path)) {
        return JSON.stringify({ error: "Can only write to CS prompt directories." });
      }
      try {
        await savePrompt(file_path, content);
        return JSON.stringify({
          success: true,
          file_path,
          change_summary,
          message: `Updated ${file_path}: ${change_summary}`,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Failed to save ${file_path}: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    },
  });

  const createKnowledgeFile = tool({
    name: "create_knowledge_file",
    description:
      "Create a brand new CS knowledge file. Use this when the user wants to add a new shared, mode-specific, or specific-guidance markdown file.",
    parameters: z.object({
      file_path: z
        .string()
        .describe("The full relative path, e.g. 'cs-general/pricing.md' or 'cs-modes/hr-expert/proof-points.md'"),
      content: z.string().describe("The full content for the new file."),
      reason: z.string().describe("Why this new file is being created."),
    }),
    execute: async ({
      file_path,
      content,
      reason,
    }: {
      file_path: string;
      content: string;
      reason: string;
    }) => {
      const filePath = file_path.replace(/^\/+/, "");
      if (!isAllowedPath(filePath)) {
        return JSON.stringify({ error: "Can only create files inside CS prompt directories." });
      }
      try {
        await savePrompt(filePath, content);
        return JSON.stringify({
          success: true,
          file_path: filePath,
          reason,
          message: `Created new file ${filePath}: ${reason}`,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Failed to create ${filePath}: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    },
  });

  const deleteKnowledgeFile = tool({
    name: "delete_knowledge_file",
    description:
      "Delete a knowledge file. Only use this when the user explicitly asks to remove an entire file. Cannot delete the safety policy.",
    parameters: z.object({
      file_path: z.string().describe("The relative path of the file to delete."),
      reason: z.string().describe("Why this file is being deleted."),
    }),
    execute: async ({ file_path, reason }: { file_path: string; reason: string }) => {
      if (file_path.includes("cs-policies/")) {
        return JSON.stringify({ error: "Cannot delete safety policy files." });
      }
      if (!file_path.startsWith("cs-general/") && !file_path.startsWith("cs-modes/") && !file_path.startsWith("cs-specific/")) {
        return JSON.stringify({ error: "Can only delete CS knowledge files." });
      }
      try {
        await deletePrompt(file_path);
        return JSON.stringify({ success: true, file_path, reason, message: `Deleted ${file_path}: ${reason}` });
      } catch (err) {
        return JSON.stringify({
          error: `Failed to delete ${file_path}: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    },
  });

  return [listKnowledgeFiles, readKnowledgeFile, updateKnowledgeFile, createKnowledgeFile, deleteKnowledgeFile];
}
