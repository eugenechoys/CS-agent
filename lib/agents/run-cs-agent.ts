import { csScopeGuardrail } from "@/lib/agents/cs-guardrails";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";
import type { CsAgentMode, CsApiEnv, CsChatResponse, CsSourceSummary } from "@/lib/schemas/cs-schemas";

export function buildCsTranscript(input: {
  message: string;
  messages?: { role: "user" | "assistant"; content: string }[];
}) {
  if (input.messages && input.messages.length > 0) {
    return input.messages.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join("\n\n");
  }
  return input.message;
}

type RunCsAgentInput = {
  message: string;
  mode: CsAgentMode;
  tenantId: string;
  userId?: string;
  tenantName?: string;
  userName?: string;
  accessToken?: string;
  apiEnv?: CsApiEnv;
  messages?: { role: "user" | "assistant"; content: string }[];
};

export async function runCsAgent(input: RunCsAgentInput): Promise<CsChatResponse> {
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

  let result;
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
    });
  } catch (guardrailError: any) {
    const info = guardrailError?.outputInfo ?? guardrailError?.message ?? "I can only help with CHOYS-related questions.";
    if (String(info).includes("can") || guardrailError?.name?.includes("Guardrail")) {
      return {
        message: typeof info === "string" ? info : "I can only help with CHOYS-related questions.",
        sourceSummaries: [],
      };
    }
    throw guardrailError;
  }

  const finalOutput = result?.finalOutput ?? result?.output ?? result;
  const message = typeof finalOutput === "string" ? finalOutput : finalOutput?.message ?? String(finalOutput);

  return {
    message,
    sourceSummaries: sourceCollector,
  };
}
