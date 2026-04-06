import { classifyIntent } from "@/lib/agents/intent";
import { hrScopeGuardrail, brevityGuardrail } from "@/lib/agents/guardrails";
import { buildArtifactsFromOutput, buildTrace } from "@/lib/agents/artifact-assembly";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";
import { buildTranscript } from "@/lib/agents/run-master-agent";
import { AgentChatOutputSchema } from "@/lib/schemas/bokchoys";
import { ensureAllSampleDatasetsLoaded, getDatasetById } from "@/lib/store/memory";

type SendEvent = (event: string, data: Record<string, unknown>) => void;

const FRIENDLY_AGENTS: Record<string, string> = {
  MasterHRAgent: "Main assistant",
  HRStrategistAgent: "Strategy expert",
  ProgramDesignerAgent: "Program designer",
  CommsPlannerAgent: "Comms planner",
  InsightsAnalystAgent: "Data analyst",
  ReportComposerAgent: "Report writer",
};

const FRIENDLY_TOOLS: Record<string, string> = {
  hr_strategist: "Brainstorming ideas",
  program_designer: "Designing program",
  comms_planner: "Planning communications",
  insights_analyst: "Analyzing data",
  report_composer: "Building report",
  generate_program_calendar: "Creating calendar",
  generate_comms_plan: "Writing messages",
  analyze_dataset: "Crunching numbers",
  build_table_artifact: "Building table",
  build_chart_spec: "Creating chart",
  build_slides_artifact: "Making slides",
};

/**
 * Runs the master agent with streaming, sending SSE events as the agent works.
 *
 * Events: "thinking" { step }, "complete" { message, artifacts, trace }, "error" { message }
 */
export async function runMasterAgentStreamed(
  input: { message: string; datasetId?: string; messages?: { role: "user" | "assistant"; content: string }[] },
  send: SendEvent,
) {
  const apiKey = ensureOpenAiApiKeyLoaded();
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  send("thinking", { step: "Understanding your request..." });

  const agentsModule = await import("@openai/agents");
  const { run } = agentsModule as any;
  const { createMasterAgent } = await import("@/lib/agents/master");
  const agent = await createMasterAgent();
  const classifiedIntent = classifyIntent(input.message);

  const allDatasets = ensureAllSampleDatasetsLoaded();
  const selectedDataset = input.datasetId ? getDatasetById(input.datasetId) : undefined;
  const transcript = buildTranscript({ ...input, allDatasets, selectedDataset });

  send("thinking", { step: "Routing to the right specialist..." });

  let result: any;
  try {
    result = await run(agent, transcript, {
      context: { classifiedIntent, allDatasets, selectedDataset, companyName: "Choys", productName: "Bokchoys" },
      inputGuardrails: [hrScopeGuardrail],
      outputGuardrails: [brevityGuardrail],
      stream: true,
    });
  } catch (guardrailError: any) {
    const info = guardrailError?.outputInfo ?? guardrailError?.message ?? "I can only help with wellbeing programs.";
    if (String(info).includes("can only help") || guardrailError?.name?.includes("Guardrail")) {
      send("complete", {
        message: typeof info === "string" ? info : "I can only help with wellbeing programs.",
        artifacts: [],
        trace: { mode: "openai", intent: "brainstorm", specialists: [], tools: [], skills: [], notes: ["Input guardrail triggered."] },
      });
      return;
    }
    throw guardrailError;
  }

  /* Iterate streaming events */
  try {
    for await (const event of result) {
      if (event.type === "agent_updated_stream_event") {
        const name = event.agent?.name ?? "specialist";
        send("thinking", { step: `Calling ${FRIENDLY_AGENTS[name] ?? name}...` });
      }
      if (event.type === "run_item_stream_event" && event.name === "tool_called") {
        const toolName = event.item?.rawItem?.name ?? event.item?.name ?? "tool";
        send("thinking", { step: FRIENDLY_TOOLS[toolName] ?? `Using ${toolName}...` });
      }
    }
  } catch (streamError) {
    console.error("[streaming] Error during stream iteration:", streamError);
  }

  send("thinking", { step: "Finishing up..." });

  /* Extract final output */
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

  send("complete", {
    ...rest,
    message: output.message,
    artifacts,
    trace: buildTrace(output.intent, datasetsUsed, agentDecided),
  });
}
