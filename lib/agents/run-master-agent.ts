import { classifyIntent } from "@/lib/agents/intent";
import { hrScopeGuardrail, brevityGuardrail } from "@/lib/agents/guardrails";
import { buildArtifactsFromOutput, buildTrace } from "@/lib/agents/artifact-assembly";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";
import { loadPrompt } from "@/lib/prompts/load-prompt";
import type { ChatResponse } from "@/lib/schemas/bokchoys";
import { AgentChatOutputSchema, ChatResponseSchema } from "@/lib/schemas/bokchoys";
import { ensureAllSampleDatasetsLoaded, getDatasetById } from "@/lib/store/memory";

/** Build the full transcript that gets sent to the agent */
function buildTranscript(input: {
  message: string;
  datasetId?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  allDatasets: any[];
  selectedDataset: any;
}) {
  const { allDatasets, selectedDataset } = input;

  const catalogLines = allDatasets.map((ds: any) => {
    const sample = ds.rows[0] ? JSON.stringify(ds.rows[0]) : "{}";
    return `- "${ds.name}" (${ds.rows.length} rows, cols: [${ds.columns.join(", ")}])\n  Sample: ${sample}`;
  });

  const quickStats: string[] = [];
  const programs = allDatasets.find((d: any) => d.name === "Programs");
  if (programs) {
    quickStats.push(`Programs: ${programs.rows.filter((r: any) => r.status === "active").length} active, ${programs.rows.filter((r: any) => r.status === "completed").length} completed`);
  }
  const pulse = allDatasets.find((d: any) => d.name === "Wellbeing Pulse");
  if (pulse) {
    const q1 = pulse.rows.filter((r: any) => r.quarter === "Q1 2025");
    if (q1.length > 0) {
      quickStats.push(`Q1 stress avg: ${(q1.map((r: any) => Number(r.stress_score ?? 0)).reduce((a: number, b: number) => a + b, 0) / q1.length).toFixed(1)}/5`);
    }
  }

  const selectedNote = selectedDataset
    ? `\nUser selected: "${selectedDataset.name}". Prioritize this.`
    : "\nNo dataset selected. Pick relevant ones.";

  const datasetContext = `[SYSTEM CONTEXT: ${allDatasets.length} datasets available:\n${catalogLines.join("\n")}${selectedNote}\n\nQuick stats: ${quickStats.join(" | ")}\n\nDo NOT ask to upload data. Analyze directly.]`;
  const structuredOutputHint = `\n\n${loadPrompt("structured-output-hint.md")}`;
  const chatHistory = input.messages && input.messages.length > 0
    ? input.messages.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join("\n\n")
    : input.message;

  return `${datasetContext}${structuredOutputHint}\n\n${chatHistory}`;
}

/** Non-streaming runner (original API — returns full JSON response) */
export async function runMasterAgent(input: {
  message: string;
  datasetId?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
}): Promise<ChatResponse> {
  const apiKey = ensureOpenAiApiKeyLoaded();
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const agentsModule = await import("@openai/agents");
  const { run } = agentsModule as any;
  const { createMasterAgent } = await import("@/lib/agents/master");
  const agent = await createMasterAgent();
  const classifiedIntent = classifyIntent(input.message);

  const allDatasets = ensureAllSampleDatasetsLoaded();
  const selectedDataset = input.datasetId ? getDatasetById(input.datasetId) : undefined;
  const transcript = buildTranscript({ ...input, allDatasets, selectedDataset });

  let result;
  try {
    result = await run(agent, transcript, {
      context: { classifiedIntent, allDatasets, selectedDataset, companyName: "Choys", productName: "Bokchoys" },
      inputGuardrails: [hrScopeGuardrail],
      outputGuardrails: [brevityGuardrail],
    });
  } catch (guardrailError: any) {
    const info = guardrailError?.outputInfo ?? guardrailError?.message ?? "I can only help with wellbeing programs.";
    if (String(info).includes("can only help") || guardrailError?.name?.includes("Guardrail")) {
      return ChatResponseSchema.parse({
        intent: "brainstorm",
        message: typeof info === "string" ? info : "I can only help with wellbeing programs.",
        artifacts: [],
        trace: { mode: "openai", intent: "brainstorm", specialists: [], tools: [], skills: [], notes: ["Input guardrail triggered."] },
      });
    }
    throw guardrailError;
  }

  /* Sanitize agent output */
  const rawOutput = result?.finalOutput ?? result?.output ?? result;
  if (rawOutput?.tables) {
    for (const table of rawOutput.tables) {
      if (table?.rows) {
        table.rows = table.rows.map((row: any) => {
          const clean: Record<string, string | number> = {};
          for (const [k, v] of Object.entries(row)) {
            clean[k] = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : v as string | number;
          }
          return clean;
        });
      }
    }
  }

  const output = AgentChatOutputSchema.parse(rawOutput);
  const { agentDecided, datasetsUsed, artifacts, ...rest } = buildArtifactsFromOutput({ message: input.message, allDatasets, output });

  return ChatResponseSchema.parse({
    ...rest,
    artifacts,
    message: output.message,
    trace: buildTrace(output.intent, datasetsUsed, agentDecided),
  });
}

/** Export buildTranscript for the streaming runner */
export { buildTranscript };
