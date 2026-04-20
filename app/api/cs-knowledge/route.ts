import { NextResponse } from "next/server";
import { listPromptFiles, loadPromptRaw, savePrompt, deletePrompt } from "@/lib/prompts/load-prompt";

const ALLOWED_PREFIXES = ["cs-general/", "cs-modes/", "cs-specific/", "cs-policies/"];

function isAllowedPromptPath(filePath: string) {
  return ALLOWED_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (filePath) {
    if (!isAllowedPromptPath(filePath)) {
      return NextResponse.json({ error: "Path must be within the CS prompt directories." }, { status: 400 });
    }
    try {
      const content = await loadPromptRaw(filePath);
      return NextResponse.json({ path: filePath, content });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  const allFiles = await listPromptFiles();
  const csFiles = allFiles.filter((f) => isAllowedPromptPath(f.path));

  return NextResponse.json({ files: csFiles });
}

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();

    if (!filePath || typeof content !== "string") {
      return NextResponse.json({ error: "path and content are required" }, { status: 400 });
    }

    if (!isAllowedPromptPath(filePath)) {
      return NextResponse.json({ error: "Path must be within the CS prompt directories." }, { status: 400 });
    }

    await savePrompt(filePath, content);
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { path: filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    if (!filePath.startsWith("cs-general/") && !filePath.startsWith("cs-modes/") && !filePath.startsWith("cs-specific/")) {
      return NextResponse.json({ error: "Only CS knowledge files can be deleted." }, { status: 400 });
    }

    await deletePrompt(filePath);
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 },
    );
  }
}
