import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";

type SendEvent = (event: string, data: Record<string, unknown>) => void;

const FRIENDLY_TOOLS: Record<string, string> = {
  list_knowledge_files: "Checking available files...",
  read_knowledge_file: "Reading file content...",
  update_knowledge_file: "Updating knowledge base...",
  create_knowledge_file: "Creating new file...",
  delete_knowledge_file: "Deleting file...",
};

/**
 * Runs the trainer agent with streaming.
 * Events: "thinking" { step }, "complete" { message, changes }, "error" { message }
 */
export async function runTrainerAgentStreamed(
  input: {
    message: string;
    messages?: { role: "user" | "assistant"; content: string }[];
  },
  send: SendEvent,
) {
  const apiKey = ensureOpenAiApiKeyLoaded();
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const agentsModule = await import("@openai/agents");
  const { run } = agentsModule as any;
  const { createTrainerAgent } = await import("@/lib/agents/trainer-agent");
  const agent = await createTrainerAgent();

  /* Build transcript from chat history */
  const transcript =
    input.messages && input.messages.length > 0
      ? input.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")
      : input.message;

  send("thinking", { step: "Understanding your instruction..." });

  let result: any;
  try {
    result = await run(agent, transcript, { stream: true });
  } catch (err: any) {
    throw err;
  }

  /* Collect file changes from tool calls */
  const changes: { action: string; file: string; summary: string }[] = [];

  try {
    for await (const event of result) {
      if (event.type === "agent_updated_stream_event") {
        send("thinking", { step: "Thinking..." });
      }
      if (event.type === "run_item_stream_event" && event.name === "tool_called") {
        const toolName = event.item?.rawItem?.name ?? event.item?.name ?? "tool";
        send("thinking", { step: FRIENDLY_TOOLS[toolName] ?? `Using ${toolName}...` });

        /* Track changes from write/create/delete tools */
        const toolOutput = event.item?.rawItem?.output ?? event.item?.output;
        if (toolOutput && typeof toolOutput === "string") {
          try {
            const parsed = JSON.parse(toolOutput);
            if (parsed.success && parsed.file_path) {
              changes.push({
                action: toolName.replace("_knowledge_file", ""),
                file: parsed.file_path,
                summary: parsed.change_summary ?? parsed.reason ?? parsed.message ?? "",
              });
            }
          } catch {
            /* Not JSON, skip */
          }
        }
      }
    }
  } catch (streamError) {
    console.error("[trainer-streaming] Error during stream iteration:", streamError);
  }

  const rawOutput = result?.finalOutput ?? result?.output ?? result;
  const message = typeof rawOutput === "string" ? rawOutput : rawOutput?.message ?? String(rawOutput);

  send("complete", { message, changes });
}
