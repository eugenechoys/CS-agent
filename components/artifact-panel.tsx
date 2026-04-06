"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtifactRenderer } from "@/lib/artifacts/renderers";
import type { ArtifactSpec, OrchestrationTrace } from "@/lib/schemas/bokchoys";

type HistoryEntry = {
  label: string;
  artifacts: ArtifactSpec[];
  trace: OrchestrationTrace | null;
};

type ArtifactPanelProps = {
  artifacts: ArtifactSpec[];
  trace: OrchestrationTrace | null;
  history?: HistoryEntry[];
  onRestoreHistory?: (index: number) => void;
};

const artifactLabels: Record<ArtifactSpec["kind"], string> = {
  idea_board: "Ideas",
  program_calendar: "Program",
  comms_plan: "Comms",
  table_report: "Table",
  chart_report: "Chart",
  slides_report: "Slides",
  kpi_dashboard: "Dashboard",
};

const artifactEmoji: Record<ArtifactSpec["kind"], string> = {
  idea_board: "💡",
  program_calendar: "📅",
  comms_plan: "💬",
  table_report: "📊",
  chart_report: "📈",
  slides_report: "📋",
  kpi_dashboard: "🎯",
};

const friendlySpecialistNames: Record<string, string> = {
  MasterHRAgent: "Main Assistant",
  HRStrategistAgent: "Strategy Expert",
  ProgramDesignerAgent: "Program Designer",
  CommsPlannerAgent: "Comms Planner",
  InsightsAnalystAgent: "Data Analyst",
  ReportComposerAgent: "Report Writer",
};

const friendlyToolNames: Record<string, string> = {
  hr_strategist: "Brainstorming",
  program_designer: "Program Design",
  comms_planner: "Comms Planning",
  insights_analyst: "Data Analysis",
  report_composer: "Report Writing",
};

const friendlySkillNames: Record<string, string> = {
  "wellbeing-program-ideation": "Wellbeing Ideas",
  "hr-engagement-design": "Engagement Design",
  "communication-strategy": "Comms Strategy",
  "game-selection": "Game Picking",
  "data-analysis": "Data Analysis",
  "executive-reporting": "Executive Reports",
  "artifact-composition": "Output Building",
};

export function ArtifactPanel({ artifacts, trace, history, onRestoreHistory }: ArtifactPanelProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const firstArtifactId = useMemo(() => artifacts[0]?.id, [artifacts]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | undefined>(firstArtifactId);

  useEffect(() => {
    setSelectedArtifactId(firstArtifactId);
  }, [firstArtifactId]);

  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ?? artifacts[0];

  return (
    <section className="surface artifact-pane">
      <div className="artifact-pane-header">
        <div>
          <span className="eyebrow">Your Results</span>
          {artifacts.length > 0 ? (
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Tap a tab to see each result. Everything here is a draft you can review.
            </p>
          ) : (
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Your results will show up here after you send a message.
            </p>
          )}
        </div>
        {artifacts.length > 0 && (
          <div className="artifact-count">{artifacts.length}</div>
        )}
      </div>

      {/* History dropdown */}
      {history && history.length > 1 && (
        <div className="artifact-history">
          <button
            className="artifact-history-toggle"
            onClick={() => setHistoryOpen(!historyOpen)}
            type="button"
          >
            <span>📂 Previous results ({history.length})</span>
            <span style={{ fontSize: "0.7rem" }}>{historyOpen ? "▲" : "▼"}</span>
          </button>
          {historyOpen && (
            <div className="artifact-history-list">
              {history.map((entry, idx) => (
                <button
                  key={idx}
                  className="artifact-history-item"
                  onClick={() => {
                    onRestoreHistory?.(idx);
                    setHistoryOpen(false);
                  }}
                  type="button"
                >
                  <span className="artifact-history-num">{idx + 1}</span>
                  <span className="artifact-history-label">{entry.label}</span>
                  <span className="artifact-history-count">{entry.artifacts.length} items</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {artifacts.length > 0 && (
        <div className="artifact-tabs">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              className={`artifact-tab ${artifact.id === selectedArtifact?.id ? "active" : ""}`}
              onClick={() => setSelectedArtifactId(artifact.id)}
              type="button"
            >
              <span className="artifact-tab-emoji">{artifactEmoji[artifact.kind]}</span>
              <span>{artifactLabels[artifact.kind]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="artifact-body">
        {selectedArtifact ? (
          <ArtifactRenderer artifact={selectedArtifact} />
        ) : (
          <article className="artifact-empty">
            <div className="artifact-empty-icon">📄</div>
            <h3>No results yet</h3>
            <p className="muted">
              Send a message and your results will appear here.
            </p>
          </article>
        )}
      </div>

      {trace && (
        <details className="trace-strip">
          <summary className="trace-toggle">
            <span className="eyebrow" style={{ padding: "4px 8px", fontSize: "0.78rem" }}>
              How I worked on this
            </span>
          </summary>
          <div className="trace-grid">
            <div className="trace-item">
              <strong>What I understood</strong>
              <div className="pill">{trace.intent.replace("_", " ")}</div>
            </div>
            <div className="trace-item">
              <strong>Who helped</strong>
              <div className="pill-row" style={{ marginTop: 4 }}>
                {trace.specialists.map((s) => (
                  <span key={s} className="pill">{friendlySpecialistNames[s] ?? s}</span>
                ))}
              </div>
            </div>
            <div className="trace-item">
              <strong>What I used</strong>
              <div className="pill-row" style={{ marginTop: 4 }}>
                {trace.tools.map((t) => (
                  <span key={t} className="pill">{friendlyToolNames[t] ?? t}</span>
                ))}
              </div>
            </div>
            <div className="trace-item">
              <strong>Knowledge applied</strong>
              <div className="pill-row" style={{ marginTop: 4 }}>
                {trace.skills.map((s) => (
                  <span key={s} className="pill">{friendlySkillNames[s] ?? s}</span>
                ))}
              </div>
            </div>
          </div>
        </details>
      )}
    </section>
  );
}
