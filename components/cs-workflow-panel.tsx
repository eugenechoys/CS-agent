"use client";

import { CS_WORKFLOW_CONFIGS } from "@/lib/cs-demo/workflow";
import type { CsAgentMode } from "@/lib/schemas/cs-schemas";

const kindColors: Record<string, string> = {
  agent: "rgba(38,107,79,0.14)",
  subagent: "rgba(38,107,79,0.1)",
  tool: "rgba(232,103,60,0.12)",
  skill: "rgba(79,70,229,0.12)",
  data: "rgba(15,118,110,0.12)",
};

export function CsWorkflowPanel({ mode }: { mode: CsAgentMode }) {
  const config = CS_WORKFLOW_CONFIGS[mode];

  return (
    <div className="surface" style={{ padding: 18 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Workflow Map</div>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{config.title}</h3>
        <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.86rem", lineHeight: 1.55 }}>
          {config.summary}
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {config.nodes.map((node) => (
          <div
            key={node.id}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 12,
              background: kindColors[node.kind] ?? "rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ fontSize: "0.9rem" }}>{node.label}</strong>
              <span
                style={{
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--muted)",
                }}
              >
                {node.kind}
              </span>
            </div>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.82rem", lineHeight: 1.5 }}>
              {node.description}
            </p>
          </div>
        ))}
      </div>

      {config.edges.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Flow</div>
          <div style={{ display: "grid", gap: 8 }}>
            {config.edges.map((edge, index) => (
              <div
                key={`${edge.from}-${edge.to}-${index}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px dashed var(--line)",
                  fontSize: "0.8rem",
                }}
              >
                <strong>{config.nodes.find((node) => node.id === edge.from)?.label}</strong> →{" "}
                <strong>{config.nodes.find((node) => node.id === edge.to)?.label}</strong>
                {edge.label ? <span className="muted"> · {edge.label}</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {config.liveDomains.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Live Domains</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {config.liveDomains.map((domain) => (
              <span key={domain} className="pill" style={{ fontSize: "0.75rem" }}>
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
