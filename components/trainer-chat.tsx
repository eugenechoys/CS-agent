"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "@/components/thinking-indicator";

type ChatMessage = { role: "user" | "assistant"; content: string };
type FileChange = { action: string; file: string; summary: string };

const starterPrompts = [
  "Update the Employee CS prompt so it asks users to select a member before personal lookups",
  "Add a new HR Expert proof point about multi-mode demos",
  "Add a FAQ about how wellness credits show up in Employee CS",
  "What's currently in the CS knowledge base and mode prompts?",
];

const initialMessage =
  "Hi Sharon & Vanessa! I'm your AI Trainer. Tell me what you want the CS demo to learn, and I'll update the shared knowledge, mode prompts, or specific support guidance for you.";

export function TrainerChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialMessage },
  ]);
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [runtimeReady, setRuntimeReady] = useState(true);
  const [recentChanges, setRecentChanges] = useState<FileChange[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    void fetch("/api/runtime")
      .then((r) => r.json())
      .then((d) => setRuntimeReady(Boolean(d.hasOpenAiKey)))
      .catch(() => setRuntimeReady(false));
  }, []);

  const canSend = prompt.trim().length > 0 && runtimeReady;

  const submitPrompt = useCallback(
    (nextPrompt?: string) => {
      const message = (nextPrompt ?? prompt).trim();
      if (!message || !runtimeReady) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
      setMessages(nextMessages);
      setPrompt("");
      setThinkingStep("Connecting...");

      startTransition(async () => {
        try {
          const response = await fetch("/api/cs-trainer-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, messages: nextMessages }),
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
                    setThinkingStep(data.step ?? "Working...");
                  } else if (currentEvent === "complete") {
                    setThinkingStep(null);
                    setMessages((cur) => [
                      ...cur,
                      { role: "assistant" as const, content: data.message as string },
                    ]);
                    if (data.changes && (data.changes as FileChange[]).length > 0) {
                      setRecentChanges((prev) => [...(data.changes as FileChange[]), ...prev]);
                    }
                  } else if (currentEvent === "error") {
                    throw new Error(data.message ?? "Trainer error.");
                  }
                } catch (parseErr) {
                  if (
                    parseErr instanceof Error &&
                    parseErr.message !== "Trainer error." &&
                    !parseErr.message.includes("JSON")
                  ) {
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
          setMessages((cur) => [...cur, { role: "assistant", content: `Oops: ${text}` }]);
        }
      });
    },
    [prompt, messages, runtimeReady],
  );

  function resetChat() {
    setMessages([{ role: "assistant", content: initialMessage }]);
    setThinkingStep(null);
  }

  const showStarters = messages.length <= 1;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Main chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
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
                    background: msg.role === "user" ? "var(--accent-strong)" : "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: msg.role === "user" ? "var(--accent-strong)" : "#f3f0ff",
                    color: msg.role === "user" ? "#fff" : "inherit",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                  }}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {thinkingStep && <ThinkingIndicator step={thinkingStep} />}

          {showStarters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {starterPrompts.map((sp) => (
                <button
                  key={sp}
                  className="button-ghost"
                  onClick={() => submitPrompt(sp)}
                  style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                >
                  {sp}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitPrompt();
                }
              }}
              placeholder="Tell me what to add, change, or remove from the knowledge base..."
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
              onClick={resetChat}
              style={{ padding: "12px 14px", flexShrink: 0, fontSize: "0.82rem" }}
            >
              Clear
            </button>
          </div>
          {!runtimeReady && (
            <p style={{ color: "#e53e3e", fontSize: "0.82rem", margin: "8px 0 0" }}>
              Missing API key. Add OPENAI_API_KEY to .env.local
            </p>
          )}
        </div>
      </div>

      {/* Changes sidebar */}
      <div
        style={{
          width: 280,
          borderLeft: "1px solid var(--line)",
          padding: 16,
          overflowY: "auto",
          background: "rgba(124,58,237,0.02)",
        }}
      >
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          Recent Changes
        </div>

        {recentChanges.length === 0 && (
          <p className="muted" style={{ fontSize: "0.82rem" }}>
            No changes yet. Tell me what to update and changes will appear here.
          </p>
        )}

        {recentChanges.map((change, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid var(--line)",
              marginBottom: 8,
              background: "rgba(255,255,255,0.8)",
              fontSize: "0.82rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    change.action === "update"
                      ? "rgba(214,158,46,0.15)"
                      : change.action === "create"
                        ? "rgba(56,161,105,0.15)"
                        : "rgba(229,62,62,0.15)",
                  color:
                    change.action === "update"
                      ? "#b7791f"
                      : change.action === "create"
                        ? "#276749"
                        : "#c53030",
                }}
              >
                {change.action}
              </span>
              <code style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{change.file}</code>
            </div>
            <div>{change.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
