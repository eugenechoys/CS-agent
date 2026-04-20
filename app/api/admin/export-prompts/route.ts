import { NextResponse } from "next/server";
import { dbExportAll } from "@/lib/db/prompts-store";
import { listPromptFilesSync, loadPromptRaw } from "@/lib/prompts/load-prompt";

/**
 * GET /api/admin/export-prompts
 * Returns all prompts as JSON — DB overrides take precedence over filesystem defaults.
 * Use this to download the full trained knowledge base and share it with others.
 */
export async function GET() {
  try {
    const dbEntries = await dbExportAll();
    const dbPathSet = new Set(dbEntries.map((e) => e.path));

    const fsFiles = listPromptFilesSync();
    const fsOnlyFiles = fsFiles.filter((f) => !dbPathSet.has(f.path));

    const fsEntries = await Promise.all(
      fsOnlyFiles.map(async (f) => ({
        path: f.path,
        content: await loadPromptRaw(f.path),
        updated_at: null,
        source: "filesystem" as const,
      })),
    );

    const result = [
      ...dbEntries.map((e) => ({ ...e, source: "database" as const })),
      ...fsEntries,
    ].sort((a, b) => a.path.localeCompare(b.path));

    return NextResponse.json(
      { exported_at: new Date().toISOString(), total: result.length, prompts: result },
      {
        headers: {
          "Content-Disposition": `attachment; filename="prompts-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 },
    );
  }
}
