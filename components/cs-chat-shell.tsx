"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import type { CsAgentMode, CsSourceSummary } from "@/lib/schemas/cs-schemas";

const starterPromptsByMode: Record<CsAgentMode, string[]> = {
  "employee-cs": [
    "What benefits does this employee currently have?",
    "Summarize this employee's insurance and wellness credits.",
    "How active has this employee been recently?",
    "Are there any open surveys or support gaps I should know about?",
  ],
  "hr-expert": [
    "How would you pitch CHOYS to a Head of People?",
    "What makes this new multi-mode CS demo strong?",
    "How should I explain the workflow map in a sales demo?",
    "What objections should HR buyers raise and how would CHOYS answer them?",
  ],
};

const assistantGreetingByMode: Record<CsAgentMode, string> = {
  "employee-cs":
    "Hi! I’m Employee CS. Ask me general CHOYS questions or selected-employee support questions like benefits, insurance, activity, and credits.",
  "hr-expert":
    "Hi! I’m HR Expert. I can help you pitch CHOYS, explain the demo, and tell a clear story for HR buyers.",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sourceSummaries?: CsSourceSummary[];
};

export function CsChatShell({
  mode,
  tenantId,
  tenantName,
  userId,
  userName,
}: {
  mode: CsAgentMode;
  tenantId: string;
  tenantName?: string;
  userId?: string;
  userName?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: assistantGreetingByMode[mode] },
  ]);
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);
  const [thinkingLog, setThinkingLog] = useState<string[]>([]);
  const [messageLogs, setMessageLogs] = useState<Map<number, string[]>>(new Map());
  const [isPending, startTransition] = useTransition();
  const [runtimeReady, setRuntimeReady] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: assistantGreetingByMode[mode] }]);
    setThinkingStep(null);
    setThinkingLog([]);
    setMessageLogs(new Map());
  }, [mode, tenantId, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    void fetch("/api/runtime")
      .then((response) => response.json())
      .then((data) => setRuntimeReady(Boolean(data.hasOpenAiKey)))
      .catch(() => setRuntimeReady(false));
  }, []);

  const canSend = prompt.trim().length > 0 && runtimeReady;
  const starters = starterPromptsByMode[mode];
  const showStarters = messages.length <= 1;

  const submitPrompt = useCallback(
    (nextPrompt?: string) => {
      const message = (nextPrompt ?? prompt).trim();
      if (!message || !runtimeReady) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
      setMessages(nextMessages);
      setPrompt("");
      setThinkingStep("Connecting...");
      setThinkingLog([]);

      startTransition(async () => {
        try {
          const response = await fetch("/api/cs-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              mode,
              tenantId,
              userId,
              messages: nextMessages.map(({ role, content }) => ({ role, content })),
              stream: true,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error ?? "Request failed.");
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No stream available.");

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            let currentEvent = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith("data: ") && currentEvent) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (currentEvent === "thinking") {
                    const step = data.step ?? "Working...";
                    setThinkingStep(step);
                    setThinkingLog((prev) => [...prev, step]);
                  } else if (currentEvent === "complete") {
                    setThinkingStep(null);
                    setMessages((current) => {
                      const next = [
                        ...current,
                        {
                          role: "assistant" as const,
                          content: data.message as string,
                          sourceSummaries: (data.sourceSummaries as CsSourceSummary[] | undefined) ?? [],
                        },
                      ];
                      setThinkingLog((log) => {
                        if (log.length > 0) {
                          setMessageLogs((prev) => new Map(prev).set(next.length - 1, [...log, "Done"]));
                        }
                        return [];
                      });
                      return next;
                    });
                  } else if (currentEvent === "error") {
                    throw new Error(data.message ?? "Agent error.");
                  }
                } catch (parseErr) {
                  if (parseErr instanceof Error && parseErr.message !== "Agent error." && !parseErr.message.includes("JSON")) {
                    throw parseErr;
                  }
                }
                currentEvent = "";
              }
            }
          }

          setThinkingStep(null);
        } catch (error) {
          setThinkingStep(null);
          const text = error instanceof Error ? error.message : "Something went wrong.";
          setMessages((current) => [...current, { role: "assistant", content: `Oops: ${text}` }]);
        }
      });
    },
    [prompt, messages, mode, tenantId, userId, runtimeReady],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid var(--line)",
            background: "rgba(38,107,79,0.04)",
            fontSize: "0.84rem",
            lineHeight: 1.5,
          }}
        >
          <strong>{mode === "employee-cs" ? "Employee CS" : "HR Expert"}</strong>
          <span className="muted"> · Tenant: {tenantName || tenantId}</span>
          {mode === "employee-cs" ? (
            <span className="muted"> · User: {userName || userId || "Not selected yet"}</span>
          ) : null}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: msg.role === "user" ? "var(--accent-strong)" : "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: msg.role === "user" ? "#fff" : "#333",
                }}
              >
                {msg.role === "user" ? "You" : mode === "employee-cs" ? "CS" : "HR"}
              </div>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: msg.role === "user" ? "var(--accent-strong)" : "#f7f7f7",
                  color: msg.role === "user" ? "#fff" : "inherit",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {msg.role === "assistant" && msg.sourceSummaries && msg.sourceSummaries.length > 0 ? (
              <details style={{ marginLeft: 42, marginTop: 6 }}>
                <summary className="muted" style={{ fontSize: "0.75rem", cursor: "pointer" }}>
                  Sources used ({msg.sourceSummaries.length})
                </summary>
                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  {msg.sourceSummaries.map((summary) => (
                    <div
                      key={`${summary.sourceId}-${summary.tenantId}-${summary.userId ?? "tenant"}`}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.75)",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "0.8rem" }}>{summary.label}</strong>
                        <span className="pill" style={{ fontSize: "0.68rem" }}>{summary.endpointGroup}</span>
                        <span className="pill" style={{ fontSize: "0.68rem" }}>{summary.sourceType}</span>
                        <span className="pill" style={{ fontSize: "0.68rem" }}>{summary.status}</span>
                      </div>
                      <div className="muted" style={{ fontSize: "0.74rem", marginTop: 6 }}>
                        Scope: {summary.scope} · Tenant: {summary.tenantId}
                        {summary.userId ? ` · User: ${summary.userId}` : ""}
                      </div>
                      <div className="muted" style={{ fontSize: "0.74rem", marginTop: 4 }}>
                        Fields: {summary.fields.join(", ")}
                      </div>
                      {summary.preview && summary.preview.length > 0 ? (
                        <div className="muted" style={{ fontSize: "0.74rem", marginTop: 4 }}>
                          Preview: {summary.preview.join(" · ")}
                        </div>
                      ) : null}
                      {summary.note ? (
                        <div className="muted" style={{ fontSize: "0.74rem", marginTop: 4 }}>
                          {summary.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </details>
            ) : null}

            {msg.role === "assistant" && messageLogs.has(index) ? (
              <details style={{ marginLeft: 42, marginTop: 4 }}>
                <summary className="muted" style={{ fontSize: "0.75rem", cursor: "pointer" }}>
                  Agent thinking ({messageLogs.get(index)!.length} steps)
                </summary>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", paddingLeft: 8, marginTop: 4 }}>
                  {messageLogs.get(index)!.map((step, stepIndex) => (
                    <div key={stepIndex}>{step}</div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        ))}

        {thinkingStep ? <ThinkingIndicator step={thinkingStep} /> : null}

        {showStarters ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {starters.map((starter) => (
              <button
                key={starter}
                className="button-ghost"
                onClick={() => submitPrompt(starter)}
                style={{ fontSize: "0.85rem", padding: "8px 14px" }}
              >
                {starter}
              </button>
            ))}
          </div>
        ) : null}

        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
              }
            }}
            placeholder={
              mode === "employee-cs"
                ? "Ask about CHOYS support, benefits, insurance, activity, or credits..."
                : "Ask how to position CHOYS to HR buyers..."
            }
            rows={1}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid var(--line)",
              fontSize: "0.92rem",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              minHeight: 44,
              maxHeight: 120,
            }}
          />
          <button
            className="button-primary"
            onClick={() => submitPrompt()}
            disabled={!canSend || isPending}
            style={{ padding: "12px 20px", flexShrink: 0 }}
          >
            {isPending ? "..." : "Send"}
          </button>
          <button
            className="button-ghost"
            onClick={() => setMessages([{ role: "assistant", content: assistantGreetingByMode[mode] }])}
            style={{ padding: "12px 14px", flexShrink: 0, fontSize: "0.82rem" }}
          >
            Clear
          </button>
        </div>
        {!runtimeReady ? (
          <p style={{ color: "#e53e3e", fontSize: "0.82rem", margin: "8px 0 0" }}>
            Missing API key. Add OPENAI_API_KEY to .env.local
          </p>
        ) : null}
      </div>
    </div>
  );
}
