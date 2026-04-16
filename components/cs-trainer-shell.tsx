"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TrainerChat } from "@/components/trainer-chat";
import { CS_WORKFLOW_CONFIGS } from "@/lib/cs-demo/workflow";
import type { CsAgentMode, CsWorkflowConfig } from "@/lib/schemas/cs-schemas";

type KnowledgeFile = { path: string; name: string; type: string };
type ConversationEntry = {
  id: string;
  mode: string;
  tenantId: string;
  userId?: string;
  messages: { role: string; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
};

type Tab = "trainer" | "knowledge" | "workflow" | "history";

type FileGroup = {
  key: string;
  label: string;
  files: KnowledgeFile[];
};

const KNOWLEDGE_GROUP_ORDER: { key: string; label: string; match: (path: string) => boolean }[] = [
  { key: "shared", label: "Shared Knowledge", match: (path) => path.startsWith("cs-general/") },
  { key: "employee", label: "Employee CS", match: (path) => path.startsWith("cs-modes/employee-cs/") },
  { key: "hr", label: "HR Expert", match: (path) => path.startsWith("cs-modes/hr-expert/") },
  { key: "specific", label: "Specific Guidance", match: (path) => path.startsWith("cs-specific/") },
  { key: "policies", label: "Policies", match: (path) => path.startsWith("cs-policies/") },
];

const diagramColors: Record<string, string> = {
  agent: "#266b4f",
  subagent: "#2f855a",
  tool: "#e8673c",
  skill: "#4f46e5",
  data: "#0f766e",
};

export function CsTrainerShell() {
  const [activeTab, setActiveTab] = useState<Tab>("trainer");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", padding: "0 16px" }}>
        {([
          { key: "trainer" as Tab, label: "AI Trainer" },
          { key: "knowledge" as Tab, label: "Knowledge Base" },
          { key: "workflow" as Tab, label: "Workflow" },
          { key: "history" as Tab, label: "History" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "12px 20px",
              fontSize: "0.88rem",
              fontWeight: activeTab === tab.key ? 600 : 400,
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--accent-strong)" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              color: activeTab === tab.key ? "var(--accent-strong)" : "var(--muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "trainer" && (
          <div style={{ height: "100%" }}>
            <TrainerChat />
          </div>
        )}
        {activeTab === "knowledge" && <KnowledgeEditor />}
        {activeTab === "workflow" && <WorkflowGallery />}
        {activeTab === "history" && <ConversationHistory />}
      </div>
    </div>
  );
}

function KnowledgeEditor() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cs-knowledge")
      .then((response) => response.json())
      .then((data) => {
        setFiles(data.files ?? []);
        if (data.files?.length > 0 && !selectedFile) {
          loadFile(data.files[0].path);
        }
      })
      .catch(console.error);
  }, []);

  const groupedFiles = useMemo<FileGroup[]>(() => {
    return KNOWLEDGE_GROUP_ORDER.map((group) => ({
      key: group.key,
      label: group.label,
      files: files.filter((file) => group.match(file.path)),
    })).filter((group) => group.files.length > 0);
  }, [files]);

  const loadFile = useCallback(async (path: string) => {
    setSelectedFile(path);
    setSaveStatus(null);
    try {
      const response = await fetch(`/api/cs-knowledge?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setContent(data.content ?? "");
      setOriginalContent(data.content ?? "");
    } catch {
      setContent("Error loading file.");
    }
  }, []);

  async function saveFile() {
    if (!selectedFile) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      await fetch("/api/cs-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedFile, content }),
      });
      setOriginalContent(content);
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("Error saving.");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = content !== originalContent;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 260, borderRight: "1px solid var(--line)", padding: 12, overflowY: "auto" }}>
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          Prompt Directories
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {groupedFiles.map((group) => (
            <div key={group.key}>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  marginBottom: 6,
                  padding: "0 6px",
                }}
              >
                {group.label}
              </div>
              <div style={{ display: "grid", gap: 2 }}>
                {group.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => loadFile(file.path)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: selectedFile === file.path ? "rgba(38,107,79,0.08)" : "transparent",
                      fontWeight: selectedFile === file.path ? 600 : 400,
                      fontSize: "0.84rem",
                      cursor: "pointer",
                      color: selectedFile === file.path ? "var(--accent-strong)" : "inherit",
                      lineHeight: 1.35,
                    }}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16 }}>
        {selectedFile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <code style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{selectedFile}</code>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {saveStatus ? (
                  <span style={{ fontSize: "0.82rem", color: saveStatus === "Saved!" ? "#38a169" : "#e53e3e" }}>
                    {saveStatus}
                  </span>
                ) : null}
                <button
                  className="button-ghost"
                  onClick={() => {
                    setContent(originalContent);
                    setSaveStatus(null);
                  }}
                  disabled={!hasChanges}
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  Revert
                </button>
                <button
                  className="button-primary"
                  onClick={saveFile}
                  disabled={!hasChanges || saving}
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              style={{
                flex: 1,
                fontFamily: "monospace",
                fontSize: "0.88rem",
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                resize: "none",
                outline: "none",
                lineHeight: 1.6,
              }}
            />
          </>
        ) : (
          <p className="muted">Select a file to edit.</p>
        )}
      </div>
    </div>
  );
}

function WorkflowGallery() {
  const [mode, setMode] = useState<CsAgentMode>("employee-cs");
  const config = CS_WORKFLOW_CONFIGS[mode];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>
      <div className="surface" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Workflow Diagram</div>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{config.title}</h3>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.85rem", maxWidth: 760, lineHeight: 1.55 }}>
              {config.summary}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([
              { key: "employee-cs" as CsAgentMode, label: "Employee CS" },
              { key: "hr-expert" as CsAgentMode, label: "HR Expert" },
            ]).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setMode(option.key)}
                className={mode === option.key ? "button-primary" : "button-ghost"}
                style={{ fontSize: "0.82rem", padding: "8px 14px" }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <WorkflowDiagram config={config} />
    </div>
  );
}

function WorkflowDiagram({ config }: { config: CsWorkflowConfig }) {
  const layout = useMemo(() => {
    const grouped = {
      agent: config.nodes.filter((node) => node.kind === "agent" || node.kind === "subagent"),
      skill: config.nodes.filter((node) => node.kind === "skill"),
      tool: config.nodes.filter((node) => node.kind === "tool"),
      data: config.nodes.filter((node) => node.kind === "data"),
    };

    const columns: Array<keyof typeof grouped> = ["agent", "skill", "tool", "data"];
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    const columnWidth = 220;
    const cardHeight = 92;
    const verticalGap = 42;
    const horizontalGap = 70;
    const padding = 48;

    columns.forEach((column, columnIndex) => {
      grouped[column].forEach((node, rowIndex) => {
        positions.set(node.id, {
          x: padding + columnIndex * (columnWidth + horizontalGap),
          y: padding + rowIndex * (cardHeight + verticalGap),
          width: columnWidth,
          height: cardHeight,
        });
      });
    });

    const maxRows = Math.max(...columns.map((column) => Math.max(grouped[column].length, 1)));
    const width = padding * 2 + columns.length * columnWidth + (columns.length - 1) * horizontalGap;
    const height = padding * 2 + maxRows * cardHeight + (maxRows - 1) * verticalGap + 90;

    return { positions, width, height, columns };
  }, [config]);

  return (
    <div className="surface" style={{ padding: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        {(["agent", "skill", "tool", "data"] as const).map((kind) => (
          <div key={kind} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--muted)" }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: diagramColors[kind],
                opacity: 0.9,
              }}
            />
            {kind === "agent" ? "Agent / subagent" : kind === "skill" ? "Skill" : kind === "tool" ? "Tool" : "Data"}
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <svg width={layout.width} height={layout.height} role="img" aria-label={`${config.title} workflow diagram`}>
          {layout.columns.map((column, columnIndex) => (
            <text
              key={column}
              x={48 + columnIndex * (220 + 70) + 110}
              y={26}
              textAnchor="middle"
              style={{ fontSize: "12px", fontWeight: 700, fill: "#69756d", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {column === "agent" ? "Agent" : column === "skill" ? "Skills" : column === "tool" ? "Tools" : "Data"}
            </text>
          ))}

          {config.edges.map((edge, index) => {
            const from = layout.positions.get(edge.from);
            const to = layout.positions.get(edge.to);
            if (!from || !to) return null;

            const startX = from.x + from.width;
            const startY = from.y + from.height / 2;
            const endX = to.x;
            const endY = to.y + to.height / 2;
            const midX = startX + (endX - startX) / 2;

            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX - 12} ${endY}`}
                  fill="none"
                  stroke="#c7cec8"
                  strokeWidth="2"
                />
                <polygon points={`${endX - 12},${endY - 6} ${endX},${endY} ${endX - 12},${endY + 6}`} fill="#c7cec8" />
                {edge.label ? (
                  <text
                    x={midX}
                    y={(startY + endY) / 2 - 10}
                    textAnchor="middle"
                    style={{ fontSize: "11px", fill: "#7a857e" }}
                  >
                    {edge.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {config.nodes.map((node) => {
            const position = layout.positions.get(node.id);
            if (!position) return null;
            const color = diagramColors[node.kind] ?? "#266b4f";

            return (
              <g key={node.id}>
                <rect
                  x={position.x}
                  y={position.y}
                  rx="18"
                  ry="18"
                  width={position.width}
                  height={position.height}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2"
                />
                <rect
                  x={position.x + 14}
                  y={position.y + 14}
                  rx="10"
                  ry="10"
                  width="52"
                  height="24"
                  fill={color}
                  opacity="0.12"
                />
                <text x={position.x + 22} y={position.y + 31} style={{ fontSize: "11px", fontWeight: 700, fill: color }}>
                  {node.kind.toUpperCase()}
                </text>
                <text x={position.x + 14} y={position.y + 58} style={{ fontSize: "14px", fontWeight: 700, fill: "#24312a" }}>
                  {node.label}
                </text>
                <text x={position.x + 14} y={position.y + 76} style={{ fontSize: "11px", fill: "#66736b" }}>
                  {truncateDiagramText(node.description, 34)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {config.liveDomains.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Live Domains</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {config.liveDomains.map((domain) => (
              <span key={domain} className="pill" style={{ fontSize: "0.75rem" }}>
                {domain}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function truncateDiagramText(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function ConversationHistory() {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cs-history")
      .then((response) => response.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", overflowY: "auto", height: "100%" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>
        Conversation History ({conversations.length})
      </h3>

      {conversations.length === 0 && (
        <div className="surface" style={{ padding: 24, textAlign: "center" }}>
          <p className="muted">No conversations yet. Chat with the CS agent to see history here.</p>
        </div>
      )}

      {conversations.map((conversation) => (
        <div key={conversation.id} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setExpanded(expanded === conversation.id ? null : conversation.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "0.88rem" }}>{conversation.mode} · {conversation.tenantId}</strong>
              <div className="muted" style={{ fontSize: "0.78rem" }}>
                {conversation.userId ? `User ${conversation.userId} · ` : ""}
                {conversation.messages.length} messages · {new Date(conversation.updatedAt).toLocaleString()}
              </div>
            </div>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {expanded === conversation.id ? "▲" : "▼"}
            </span>
          </button>

          {expanded === conversation.id ? (
            <div style={{ padding: "8px 16px", borderLeft: "2px solid var(--line)", marginLeft: 16, marginTop: 4 }}>
              {conversation.messages.map((message, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: message.role === "user" ? "var(--accent-strong)" : "var(--muted)" }}>
                    {message.role === "user" ? "User" : "Agent"}
                    <span style={{ fontWeight: 400, marginLeft: 8 }}>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", marginTop: 2 }}>{message.content}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
