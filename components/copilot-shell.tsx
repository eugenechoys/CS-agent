"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { ArtifactPanel } from "@/components/artifact-panel";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import type {
  ArtifactSpec,
  ChatMessage,
  ChatResponse,
  OrchestrationTrace,
} from "@/lib/schemas/bokchoys";

const starterPrompts = [
  "Help me brainstorm a stress relief program for remote workers",
  "Design a one-day hydration challenge with all the comms",
  "What does our wellbeing data tell us?",
  "Make a quick leadership report from the data",
];

const initialAssistantMessage =
  "Hi! I'm Bokchoys, your wellbeing program helper. Tell me what you need - I can brainstorm ideas, design programs, analyze data, or create reports.";

export function CopilotShell() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: initialAssistantMessage,
    },
  ]);
  const [artifacts, setArtifacts] = useState<ArtifactSpec[]>([]);
  const [artifactHistory, setArtifactHistory] = useState<{ label: string; artifacts: ArtifactSpec[]; trace: OrchestrationTrace | null }[]>([]);
  const [trace, setTrace] = useState<OrchestrationTrace | null>(null);
  const [datasetId, setDatasetId] = useState<string | undefined>();
  const [datasetLabel, setDatasetLabel] = useState<string>("Using sample data");
  const [runtimeReady, setRuntimeReady] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobilePane, setMobilePane] = useState<"chat" | "artifacts">("chat");
  const [isPending, startTransition] = useTransition();
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);
  const [thinkingLog, setThinkingLog] = useState<string[]>([]);
  const [messageLogs, setMessageLogs] = useState<Map<number, string[]>>(new Map());

  /* ── resizable split ── */
  const [chatWidthPercent, setChatWidthPercent] = useState(30);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;

    function onMove(ev: MouseEvent) {
      if (!draggingRef.current || !layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setChatWidthPercent(Math.min(60, Math.max(20, pct)));
    }

    function onUp() {
      draggingRef.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function syncViewport() {
      setIsMobile(window.innerWidth < 980);
    }
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    void fetch("/api/runtime")
      .then((r) => r.json())
      .then((d) => setRuntimeReady(Boolean(d.hasOpenAiKey)))
      .catch(() => setRuntimeReady(false));

  }, []);

  const canSend = useMemo(() => prompt.trim().length > 0 && runtimeReady, [prompt, runtimeReady]);

  async function submitPrompt(nextPrompt?: string) {
    const message = (nextPrompt ?? prompt).trim();
    if (!message || !runtimeReady) return;

    const nextMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(nextMessages);
    setPrompt("");
    if (isMobile) setMobilePane("chat");

    setThinkingStep("Connecting...");
    setThinkingLog([]);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, datasetId, messages: nextMessages, stream: true }),
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
                  setMessages((cur) => {
                    const next = [...cur, { role: "assistant" as const, content: data.message as string }];
                    /* Save thinking log for this message */
                    setThinkingLog((log) => {
                      if (log.length > 0) {
                        setMessageLogs((prev) => new Map(prev).set(next.length - 1, [...log, "Done"]));
                      }
                      return [];
                    });
                    return next;
                  });
                  setArtifacts(data.artifacts ?? []);
                  setTrace(data.trace ?? null);
                  if (data.artifacts?.length > 0) {
                    const label = message.length > 40 ? message.slice(0, 37) + "..." : message;
                    setArtifactHistory((prev) => [...prev, { label, artifacts: data.artifacts, trace: data.trace }]);
                  }
                  if (isMobile) setMobilePane("artifacts");
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
        setMessages((cur) => [...cur, { role: "assistant", content: `Oops: ${text}` }]);
      }
    });
  }

  async function uploadDataset(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Upload failed.");
    setDatasetId(data.id);
    setDatasetLabel(`${data.name} - ${data.rowCount} rows`);
  }

  function resetChat() {
    setMessages([{ role: "assistant", content: initialAssistantMessage }]);
    setArtifacts([]);
    setArtifactHistory([]);
    setTrace(null);
    setPrompt("");
    setMessageLogs(new Map());
  }

  /* ── chat pane ── */
  const chatPane = (
    <section className="surface chat-pane">
      <div className="copilot-header">
        <div>
          <span className="eyebrow">Bokchoys</span>
          <h1 className="copilot-title">What can I help you with?</h1>
        </div>
        <div className={`runtime-dot ${runtimeReady ? "live" : "off"}`}>
          <span className="dot" />
          {runtimeReady ? "Ready" : "Setup needed"}
        </div>
      </div>

      <div className="dataset-strip">
        <span className={`mini-link ${datasetId ? "dataset-active" : ""}`}>
          {datasetId ? `✅ ${datasetLabel}` : "📊 7 datasets loaded"}
        </span>
        <a href="/raw-data" target="_blank" className="mini-link data-link">
          Browse data →
        </a>
      </div>

      {messages.length <= 1 && (
        <div className="starter-row">
          {starterPrompts.map((item) => (
            <button
              key={item}
              className="starter-chip"
              onClick={() => void submitPrompt(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="chat-list compact">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`}>
            <div className={`chat-bubble ${message.role}`}>
              {message.role === "assistant" ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            {/* Show thinking log for this message */}
            {message.role === "assistant" && messageLogs.has(index) && (
              <details className="thinking-log">
                <summary className="thinking-log-toggle">
                  Agent thinking process ({messageLogs.get(index)!.length} steps)
                </summary>
                <div className="thinking-log-steps">
                  {messageLogs.get(index)!.map((step, i) => (
                    <div key={i} className="thinking-log-step">
                      <span className="thinking-log-dot" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
        {(isPending || thinkingStep) && <ThinkingIndicator step={thinkingStep} />}
        <div ref={chatEndRef} />
      </div>

      <div className="composer compact">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell me what you need..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submitPrompt();
            }
          }}
        />
        <div className="composer-toolbar">
          <label className="mini-link upload-label">
            Upload CSV
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadDataset(file);
              }}
            />
          </label>
          <button className="button-ghost" onClick={resetChat} type="button">
            New chat
          </button>
          <button
            className="button-primary"
            disabled={!canSend || isPending}
            onClick={() => void submitPrompt()}
            type="button"
          >
            {isPending ? "Working..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );

  /* ── artifact pane ── */
  const artifactPane = (
    <div className="artifact-pane-wrap">
      <ArtifactPanel
        artifacts={artifacts}
        trace={trace}
        history={artifactHistory}
        onRestoreHistory={(idx) => {
          const entry = artifactHistory[idx];
          if (entry) {
            setArtifacts(entry.artifacts);
            setTrace(entry.trace);
          }
        }}
      />
    </div>
  );

  /* ── layout ── */
  return (
    <div className="copilot-mobile-shell">
      {isMobile ? (
        <>
          <div className="mobile-switcher">
            <button
              className={`mobile-switch ${mobilePane === "chat" ? "active" : ""}`}
              onClick={() => setMobilePane("chat")}
              type="button"
            >
              Chat
            </button>
            <button
              className={`mobile-switch ${mobilePane === "artifacts" ? "active" : ""}`}
              onClick={() => setMobilePane("artifacts")}
              type="button"
            >
              Results ({artifacts.length})
            </button>
          </div>
          {mobilePane === "chat" ? chatPane : artifactPane}
        </>
      ) : (
        <div
          className="copilot-layout resizable"
          ref={layoutRef}
          style={{
            gridTemplateColumns: `${chatWidthPercent}% 6px minmax(0,1fr)`,
          }}
        >
          {chatPane}
          <div className="resize-handle" onMouseDown={onDragStart}>
            <div className="resize-grip" />
          </div>
          {artifactPane}
        </div>
      )}
    </div>
  );
}
