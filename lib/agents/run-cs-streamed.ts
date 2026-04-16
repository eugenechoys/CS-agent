import { csScopeGuardrail } from "@/lib/agents/cs-guardrails";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";
import { buildCsTranscript } from "@/lib/agents/run-cs-agent";
import type { CsAgentMode, CsApiEnv, CsSourceSummary } from "@/lib/schemas/cs-schemas";

type SendEvent = (event: string, data: Record<string, unknown>) => void;

const FRIENDLY_TOOLS: Record<string, string> = {
  lookup_live_support_context: "Checking the selected employee's support data...",
};

export async function runCsAgentStreamed(
  input: {
    message: string;
    mode: CsAgentMode;
    tenantId: string;
    userId?: string;
    tenantName?: string;
    userName?: string;
    accessToken?: string;
    apiEnv?: CsApiEnv;
    messages?: { role: "user" | "assistant"; content: string }[];
  },
  send: SendEvent,
) {
  const apiKey = ensureOpenAiApiKeyLoaded();
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const agentsModule = await import("@openai/agents");
  const { run } = agentsModule as any;
  const { createCsAgent } = await import("@/lib/agents/cs-agent");
  const sourceCollector: CsSourceSummary[] = [];
  const agent = await createCsAgent({
    mode: input.mode,
    accessToken: input.accessToken,
    apiEnv: input.apiEnv,
    sourceCollector,
  });

  const transcript = buildCsTranscript(input);

  send("thinking", { step: "Understanding your question..." });

  let result: any;
  try {
    result = await run(agent, transcript, {
      context: {
        mode: input.mode,
        tenantId: input.tenantId,
        userId: input.userId,
        tenantName: input.tenantName,
        userName: input.userName,
      },
      inputGuardrails: [csScopeGuardrail],
      stream: true,
    });
  } catch (guardrailError: any) {
    const info = guardrailError?.outputInfo ?? guardrailError?.message ?? "I can only help with CHOYS-related questions.";
    if (String(info).includes("can") || guardrailError?.name?.includes("Guardrail")) {
      send("complete", {
        message: typeof info === "string" ? info : "I can only help with CHOYS-related questions.",
        sourceSummaries: [],
      });
      return;
    }
    throw guardrailError;
  }

  try {
    for await (const event of result) {
      if (event.type === "agent_updated_stream_event") {
        send("thinking", { step: "Thinking..." });
      }
      if (event.type === "run_item_stream_event" && event.name === "tool_called") {
        const toolName = event.item?.rawItem?.name ?? event.item?.name ?? "tool";
        send("thinking", { step: FRIENDLY_TOOLS[toolName] ?? `Using ${toolName}...` });
      }
    }
  } catch (streamError) {
    console.error("[cs-streaming] Error during stream iteration:", streamError);
  }

  const rawOutput = result?.finalOutput ?? result?.output ?? result;
  const message = typeof rawOutput === "string" ? rawOutput : rawOutput?.message ?? String(rawOutput);

  send("complete", { message, sourceSummaries: sourceCollector });
}
