import { loadPrompt } from "@/lib/prompts/load-prompt";

export async function createTrainerAgent() {
  const agentsModule = await import("@openai/agents");
  const { Agent } = agentsModule as any;
  const { createTrainerTools } = await import("@/lib/tools/trainer-tools");

  const tools = await createTrainerTools();

  return new Agent({
    name: "ChoysTrainerAgent",
    model: "gpt-5.1",
    instructions: () => loadPrompt("cs-trainer-agent.md"),
    tools,
  });
}
