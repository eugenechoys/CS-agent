import { runTrainerAgentStreamed } from "@/lib/agents/run-trainer-streamed";
import { z } from "zod";
import { ZodError } from "zod";
import { ensureDBCacheWarmed } from "@/lib/prompts/load-prompt";

const TrainerChatSchema = z.object({
  message: z.string().min(1),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

export async function POST(request: Request) {
  try {
    await ensureDBCacheWarmed();
    const body = await request.json();
    const parsed = TrainerChatSchema.parse(body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            );
          } catch {
            /* Controller may be closed */
          }
        };

        try {
          await runTrainerAgentStreamed(parsed, send);
        } catch (error) {
          send("error", {
            message: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown trainer error";
    return Response.json(
      { error: message },
      { status: error instanceof ZodError ? 400 : 500 },
    );
  }
}
