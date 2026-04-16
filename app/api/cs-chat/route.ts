import { NextResponse } from "next/server";
import { runCsAgent } from "@/lib/agents/run-cs-agent";
import { runCsAgentStreamed } from "@/lib/agents/run-cs-streamed";
import { saveCsConversation, getCsConversation } from "@/lib/store/memory";
import { CsChatRequestSchema } from "@/lib/schemas/cs-schemas";
import { ZodError } from "zod";
import { cookies } from "next/headers";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CsChatRequestSchema.parse(body);
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(CS_DEMO_COOKIE_KEYS.accessToken)?.value;
    const apiEnv = cookieStore.get(CS_DEMO_COOKIE_KEYS.apiEnv)?.value === "prod" ? "prod" : "dev";

    const useStreaming = body.stream === true;

    if (useStreaming) {
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
          await runCsAgentStreamed({
            ...parsed,
            accessToken,
            apiEnv,
          }, send);
        } catch (error) {
          send("error", { message: error instanceof Error ? error.message : "Unknown error" });
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
    }

    /* Non-streaming response */
    const result = await runCsAgent({
      ...parsed,
      accessToken,
      apiEnv,
    });

    /* Save to conversation history */
    if (parsed.tenantId) {
      const convId = body.conversationId ?? `cs-conv-${Math.random().toString(36).slice(2, 10)}`;
      const existing = getCsConversation(convId);
      const now = new Date().toISOString();
      saveCsConversation({
        id: convId,
        mode: parsed.mode,
        tenantId: parsed.tenantId,
        userId: parsed.userId,
        messages: [
          ...(existing?.messages ?? []),
          { role: "user", content: parsed.message, timestamp: now },
          { role: "assistant", content: result.message, timestamp: now },
        ],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CS chat error";
    return NextResponse.json(
      { error: message },
      { status: error instanceof ZodError ? 400 : 500 },
    );
  }
}
