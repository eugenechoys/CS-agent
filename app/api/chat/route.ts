import { NextResponse } from "next/server";
import { runMasterAgent } from "@/lib/agents/run-master-agent";
import { runMasterAgentStreamed } from "@/lib/agents/run-master-streamed";
import { saveArtifacts } from "@/lib/store/memory";
import { ChatRequestSchema } from "@/lib/schemas/bokchoys";
import { ZodError } from "zod";
import { ensureDBCacheWarmed } from "@/lib/prompts/load-prompt";

export async function POST(request: Request) {
  try {
    await ensureDBCacheWarmed();
    const body = await request.json();
    const parsed = ChatRequestSchema.parse(body);

    /* Check if client wants streaming */
    const useStreaming = body.stream === true;

    if (useStreaming) {
      /* SSE streaming response */
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: string, data: Record<string, unknown>) => {
            try {
              controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            } catch {
              /* Controller may be closed */
            }
          };

          try {
            await runMasterAgentStreamed(parsed, send);
          } catch (error) {
            send("error", { message: error instanceof Error ? error.message : "Unknown error" });
          } finally {
            try { controller.close(); } catch { /* already closed */ }
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    /* Non-streaming response (original behavior) */
    const result = await runMasterAgent(parsed);
    saveArtifacts(result.artifacts);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error";
    return NextResponse.json(
      { error: message },
      { status: error instanceof ZodError ? 400 : 500 },
    );
  }
}
