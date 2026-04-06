import { getApprovalPolicyText } from "@/lib/policies/approval-policy";
import { getSafetyPolicyText } from "@/lib/policies/safety-policy";
import { loadPrompt } from "@/lib/prompts/load-prompt";

export async function createMasterAgent() {
  const agentsModule = await import("@openai/agents");
  const { Agent } = agentsModule as any;
  const { AgentChatOutputSchema } = await import("@/lib/schemas/bokchoys");
  const specialists = await import("@/lib/agents/specialists");

  const {
    strategistAgent,
    programDesignerAgent,
    commsPlannerAgent,
    insightsAnalystAgent,
    reportComposerAgent,
  } = await specialists.createSpecialistAgents();

  return new Agent({
    name: "MasterHRAgent",
    model: "gpt-5.1",
    outputType: AgentChatOutputSchema,
    instructions: ({ context }: any) =>
      [
        loadPrompt("master-agent.md"),
        `Current intent signal: ${context?.classifiedIntent ?? "unknown"}.`,
        getApprovalPolicyText(),
        getSafetyPolicyText(),
      ].join("\n\n"),
    tools: [
      strategistAgent.asTool({
        toolName: "hr_strategist",
        toolDescription: "Use for vague or early-stage brainstorming requests.",
      }),
      programDesignerAgent.asTool({
        toolName: "program_designer",
        toolDescription: "Use for building draft engagement programs and activity mixes.",
      }),
      commsPlannerAgent.asTool({
        toolName: "comms_planner",
        toolDescription: "Use for before, during, and after communication sequencing and copy.",
      }),
      insightsAnalystAgent.asTool({
        toolName: "insights_analyst",
        toolDescription: "Use for dataset-grounded analysis and analytical tables.",
      }),
      reportComposerAgent.asTool({
        toolName: "report_composer",
        toolDescription: "Use for chart and slides-style reporting outputs.",
      }),
    ],
  });
}
