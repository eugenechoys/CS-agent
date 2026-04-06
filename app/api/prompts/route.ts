import { NextResponse } from "next/server";
import { listPromptFiles, loadPromptRaw, savePrompt } from "@/lib/prompts/load-prompt";

/** GET /api/prompts - list all prompts */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const file = url.searchParams.get("file");

    if (file) {
      /* Return single prompt raw content */
      const content = loadPromptRaw(file);
      return NextResponse.json({ file, content });
    }

    /* List all prompt files */
    const files = listPromptFiles();
    return NextResponse.json({ files });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load prompts";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** POST /api/prompts - save a prompt */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file, content } = body;

    if (!file || typeof file !== "string") {
      throw new Error("Missing file path");
    }
    if (!content || typeof content !== "string") {
      throw new Error("Missing content");
    }

    savePrompt(file, content);
    return NextResponse.json({ success: true, file });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save prompt";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
