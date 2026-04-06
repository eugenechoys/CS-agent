"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type PromptFile = {
  path: string;
  type: "agent" | "specialist" | "skill" | "policy" | "other";
  name: string;
};

const typeLabels: Record<PromptFile["type"], { label: string; emoji: string; color: string }> = {
  agent: { label: "Agent", emoji: "🎯", color: "rgba(38,107,79,0.12)" },
  specialist: { label: "Specialist", emoji: "🧠", color: "rgba(217,140,61,0.12)" },
  skill: { label: "Skill", emoji: "📚", color: "rgba(74,144,217,0.12)" },
  policy: { label: "Policy", emoji: "🛡️", color: "rgba(141,47,47,0.12)" },
  other: { label: "Other", emoji: "📄", color: "rgba(0,0,0,0.06)" },
};

export default function PromptsPage() {
  const [files, setFiles] = useState<PromptFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(false);

  /* Load file list */
  useEffect(() => {
    void fetch("/api/prompts")
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.files ?? []);
        /* Auto-select master agent */
        if (d.files?.length > 0) {
          const master = d.files.find((f: PromptFile) => f.type === "agent");
          if (master) selectFile(master.path);
        }
      })
      .catch(() => setFiles([]));
  }, []);

  /* Load a specific file */
  const selectFile = useCallback((filePath: string) => {
    setSelectedFile(filePath);
    setLoading(true);
    setSaveStatus("idle");
    void fetch(`/api/prompts?file=${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content ?? "");
        setOriginalContent(d.content ?? "");
        setLoading(false);
      })
      .catch(() => {
        setContent("Error loading file");
        setLoading(false);
      });
  }, []);

  /* Save */
  async function handleSave() {
    if (!selectedFile) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedFile, content }),
      });
      if (!res.ok) throw new Error("Save failed");
      setOriginalContent(content);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = content !== originalContent;

  /* Group files by type */
  const grouped = {
    agent: files.filter((f) => f.type === "agent"),
    specialist: files.filter((f) => f.type === "specialist"),
    skill: files.filter((f) => f.type === "skill"),
    policy: files.filter((f) => f.type === "policy"),
    other: files.filter((f) => f.type === "other"),
  };

  const selectedMeta = files.find((f) => f.path === selectedFile);

  return (
    <main className="container" style={{ padding: "24px 0 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/" className="button-ghost">Home</Link>
        <Link href="/copilot" className="button-ghost">Copilot</Link>
        <Link href="/raw-data" className="button-ghost">Raw Data</Link>
      </div>

      <section className="surface" style={{ padding: 28, marginBottom: 20 }}>
        <span className="eyebrow">Prompt Editor</span>
        <h1 className="landing-hero-title" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>
          Edit agent prompts
        </h1>
        <p className="muted" style={{ maxWidth: 600, margin: "0 0 0" }}>
          View and edit the prompts that control how the AI agents think. Changes are saved to disk and take effect on the next request.
        </p>
      </section>

      <div className="prompt-editor-layout">
        {/* Sidebar: file list */}
        <aside className="surface prompt-sidebar">
          {(["agent", "specialist", "skill", "policy", "other"] as const).map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;
            const meta = typeLabels[type];
            return (
              <div key={type} style={{ marginBottom: 16 }}>
                <div className="prompt-group-label">
                  <span>{meta.emoji}</span> {meta.label}s
                </div>
                {group.map((file) => (
                  <button
                    key={file.path}
                    className={`prompt-file-btn ${file.path === selectedFile ? "active" : ""}`}
                    onClick={() => selectFile(file.path)}
                    type="button"
                  >
                    <span className="prompt-file-name">{file.name}</span>
                    <span className="prompt-file-path">{file.path}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </aside>

        {/* Editor */}
        <div className="prompt-editor-main">
          {selectedFile ? (
            <section className="surface" style={{ padding: 20, height: "100%" }}>
              {/* Editor header */}
              <div className="prompt-editor-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {selectedMeta && (
                      <span
                        className="pill"
                        style={{
                          background: typeLabels[selectedMeta.type].color,
                          fontSize: "0.78rem",
                        }}
                      >
                        {typeLabels[selectedMeta.type].emoji} {typeLabels[selectedMeta.type].label}
                      </span>
                    )}
                    <strong style={{ fontSize: "1.1rem" }}>{selectedMeta?.name ?? selectedFile}</strong>
                  </div>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>prompts/{selectedFile}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {hasChanges && (
                    <span style={{ fontSize: "0.82rem", color: "var(--warm)", fontWeight: 600 }}>
                      Unsaved changes
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>
                      Saved!
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span style={{ fontSize: "0.82rem", color: "var(--danger)", fontWeight: 600 }}>
                      Save failed
                    </span>
                  )}
                  <button
                    className="button-ghost"
                    onClick={() => {
                      setContent(originalContent);
                      setSaveStatus("idle");
                    }}
                    disabled={!hasChanges}
                    type="button"
                  >
                    Revert
                  </button>
                  <button
                    className="button-primary"
                    onClick={() => void handleSave()}
                    disabled={!hasChanges || saving}
                    type="button"
                    style={{ padding: "8px 20px" }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Textarea editor */}
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>
              ) : (
                <textarea
                  className="prompt-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                />
              )}

              {/* Stats */}
              <div className="prompt-stats">
                <span>{content.split("\n").length} lines</span>
                <span>{content.length} chars</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </section>
          ) : (
            <section className="surface" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📝</div>
              <h3>Select a prompt to edit</h3>
              <p className="muted">Pick a file from the sidebar to view and edit its content.</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
