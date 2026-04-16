import { loadAllKnowledgeFiles, loadPrompt } from "@/lib/prompts/load-prompt";
import type { CsAgentMode, CsApiEnv, CsSourceSummary } from "@/lib/schemas/cs-schemas";

function buildRuntimeContext(context: {
  mode: CsAgentMode;
  tenantId: string;
  userId?: string;
  tenantName?: string;
  userName?: string;
}) {
  const persona =
    context.mode === "employee-cs"
      ? "Employee CS mode is active."
      : "HR Expert mode is active.";

  return [
    persona,
    `Selected tenant ID: ${context.tenantId}.`,
    context.tenantName ? `Selected tenant name: ${context.tenantName}.` : undefined,
    context.userId ? `Selected user ID: ${context.userId}.` : "No user is selected yet.",
    context.userName ? `Selected user name: ${context.userName}.` : undefined,
    context.mode === "employee-cs" && context.userId
      ? 'When the person asks about "my" benefits, insurance, credits, activity, or profile, use the lookup_live_support_context tool with the selected tenant and user.'
      : undefined,
    context.mode === "employee-cs" && !context.userId
      ? "No user is selected yet. Answer general CHOYS questions, and ask them to pick a user if they want personal details."
      : undefined,
    context.mode === "hr-expert"
      ? "Do not access or imply personal employee data. Stay focused on sales, product proof points, and demo positioning."
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildInstructions(mode: CsAgentMode, context: any) {
  const sharedKnowledge = loadAllKnowledgeFiles("cs-general");
  const modePrompt = loadPrompt(`cs-modes/${mode}/agent.md`);
  const modeKnowledge =
    mode === "employee-cs"
      ? loadPrompt("cs-modes/employee-cs/source-summary.md")
      : loadPrompt("cs-modes/hr-expert/proof-points.md");
  const specificGuidance = loadAllKnowledgeFiles("cs-specific");
  const safetyPolicy = loadPrompt("cs-policies/cs-safety-policy.md");

  return [
    modePrompt,
    "\n\n# Shared Knowledge\n\n",
    sharedKnowledge,
    "\n\n# Mode Knowledge\n\n",
    modeKnowledge,
    "\n\n# Specific API Guidance\n\n",
    specificGuidance,
    "\n\n# Safety Policy\n\n",
    safetyPolicy,
    "\n\n# Runtime Context\n\n",
    buildRuntimeContext({
      mode,
      tenantId: context?.tenantId,
      userId: context?.userId,
      tenantName: context?.tenantName,
      userName: context?.userName,
    }),
  ].join("");
}

export async function createCsAgent({
  mode,
  accessToken,
  apiEnv,
  sourceCollector,
}: {
  mode: CsAgentMode;
  accessToken?: string;
  apiEnv?: CsApiEnv;
  sourceCollector: CsSourceSummary[];
}) {
  const agentsModule = await import("@openai/agents");
  const { Agent } = agentsModule as any;

  const tools =
    mode === "employee-cs"
      ? await (await import("@/lib/tools/cs-tools")).createEmployeeSupportTools({
          accessToken,
          apiEnv,
          sourceCollector,
        })
      : [];

  return new Agent({
    name: mode === "employee-cs" ? "ChoysEmployeeSupportAgent" : "ChoysHRExpertAgent",
    model: "gpt-5.1",
    instructions: ({ context }: any) => buildInstructions(mode, context),
    tools,
  });
}
