import { NextResponse } from "next/server";
import { runMasterAgent } from "@/lib/agents/run-master-agent";
import { saveArtifacts } from "@/lib/store/memory";
import { ChatRequestSchema } from "@/lib/schemas/bokchoys";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.parse(body);
    const result = await runMasterAgent(parsed);

    saveArtifacts(result.artifacts);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error";
    return NextResponse.json(
      {
        error: message,
      },
      { status: error instanceof ZodError ? 400 : 500 },
    );
  }
}
