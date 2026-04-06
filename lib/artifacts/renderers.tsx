import type { ArtifactSpec } from "@/lib/schemas/bokchoys";

/* ─── Channel UI mockup icons & colors ─── */

const channelMeta: Record<string, { icon: string; color: string; bg: string; name: string }> = {
  whatsapp: { icon: "💬", color: "#25D366", bg: "rgba(37,211,102,0.08)", name: "WhatsApp" },
  email: { icon: "📧", color: "#4A90D9", bg: "rgba(74,144,217,0.08)", name: "Email" },
  slack: { icon: "💻", color: "#4A154B", bg: "rgba(74,21,75,0.08)", name: "Slack" },
  teams: { icon: "🟪", color: "#6264A7", bg: "rgba(98,100,167,0.08)", name: "Teams" },
  browser_extension: { icon: "🌐", color: "#D98C3D", bg: "rgba(217,140,61,0.08)", name: "Browser" },
};

function ChannelBadge({ channel }: { channel: string }) {
  const meta = channelMeta[channel] ?? { icon: "📨", color: "#666", bg: "#f5f5f5", name: channel };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        fontSize: "0.82rem",
        fontWeight: 600,
        border: `1px solid ${meta.color}22`,
      }}
    >
      {meta.icon} {meta.name}
    </span>
  );
}

/* ─── Channel-specific message preview ─── */

function ChannelMessagePreview({ channel, copy, purpose }: { channel: string; copy: string; purpose: string }) {
  const meta = channelMeta[channel] ?? channelMeta.email;

  if (channel === "whatsapp") {
    return (
      <div style={{ background: "#ECE5DD", borderRadius: 12, padding: 12, maxWidth: 340 }}>
        <div style={{ background: "#DCF8C6", borderRadius: "0 10px 10px 10px", padding: "8px 12px", fontSize: "0.9rem", lineHeight: 1.4 }}>
          {copy}
          <div style={{ textAlign: "right", fontSize: "0.72rem", color: "#999", marginTop: 4 }}>9:00 AM ✓✓</div>
        </div>
      </div>
    );
  }

  if (channel === "slack" || channel === "teams") {
    const appName = channel === "slack" ? "Slack" : "Teams";
    const accent = channel === "slack" ? "#4A154B" : "#6264A7";
    return (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
            BC
          </div>
          <div>
            <strong style={{ fontSize: "0.88rem" }}>Bokchoys</strong>
            <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: 6 }}>APP</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: "auto" }}>9:00 AM</span>
        </div>
        <div style={{ fontSize: "0.9rem", lineHeight: 1.45, paddingLeft: 36 }}>{copy}</div>
      </div>
    );
  }

  if (channel === "browser_extension") {
    return (
      <div style={{ background: "#FFFBF0", borderRadius: 12, border: "1px solid #E8DCC8", padding: 12, maxWidth: 300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: "1rem" }}>🌿</span>
          <strong style={{ fontSize: "0.82rem" }}>Bokchoys Nudge</strong>
        </div>
        <div style={{ fontSize: "0.88rem", lineHeight: 1.4, color: "#555" }}>{copy}</div>
      </div>
    );
  }

  /* email (default) */
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ background: "#f8f8f8", padding: "8px 12px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: "0.8rem", color: "#999" }}>From:</span>
        <strong style={{ fontSize: "0.85rem" }}>hr@company.com</strong>
      </div>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontSize: "0.8rem", color: "#999" }}>Subject:</span>
        <span style={{ fontSize: "0.85rem", marginLeft: 6 }}>{purpose}</span>
      </div>
      <div style={{ padding: 12, fontSize: "0.9rem", lineHeight: 1.45 }}>{copy}</div>
    </div>
  );
}

/* ─── Poll/Survey question renderers ─── */

function PollQuestionCard({ q }: { q: { question: string; options: { label: string; emoji?: string }[] } }) {
  return (
    <div style={{ padding: 14, borderRadius: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
      <strong style={{ display: "block", marginBottom: 8, fontSize: "0.92rem" }}>{q.question}</strong>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.options.map((opt) => (
          <div
            key={opt.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(38,107,79,0.04)",
              cursor: "default",
              fontSize: "0.88rem",
            }}
          >
            {opt.emoji && <span>{opt.emoji}</span>}
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SurveyQuestionCard({ q }: { q: { question: string; type: string; options?: string[] } }) {
  return (
    <div style={{ padding: 14, borderRadius: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span className="pill" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>{q.type.replace("_", " ")}</span>
        <strong style={{ fontSize: "0.92rem" }}>{q.question}</strong>
      </div>
      {q.type === "likert" && q.options && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {q.options.map((opt) => (
            <div
              key={opt}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "#fff",
                fontSize: "0.82rem",
                textAlign: "center",
                minWidth: 44,
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      {q.type === "multiple_choice" && q.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {q.options.map((opt) => (
            <div
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "#fff",
                fontSize: "0.86rem",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--accent)", flexShrink: 0 }} />
              {opt}
            </div>
          ))}
        </div>
      )}
      {q.type === "open_text" && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px dashed var(--line)",
            background: "#fafafa",
            color: "#aaa",
            fontSize: "0.86rem",
            minHeight: 48,
          }}
        >
          Type your answer here...
        </div>
      )}
    </div>
  );
}

/* ─── Activity card with expanded poll/survey ─── */

function ActivityCard({ activity }: { activity: any }) {
  const typeEmoji: Record<string, string> = {
    poll: "📊",
    survey: "📝",
    game: "🎮",
    nudge: "💡",
    event: "📆",
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 12,
          background: "rgba(38,107,79,0.1)",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--accent-strong)",
          marginBottom: 8,
        }}
      >
        {typeEmoji[activity.type] ?? "📌"} {activity.title}
      </div>
      <div className="muted" style={{ fontSize: "0.88rem", marginBottom: 6 }}>{activity.description}</div>

      {/* Show poll questions if available */}
      {activity.type === "poll" && activity.pollQuestions && activity.pollQuestions.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.03em", marginBottom: 6 }}>
            Preview: Poll Questions
          </div>
          {activity.pollQuestions.map((q: any, i: number) => (
            <PollQuestionCard key={i} q={q} />
          ))}
        </div>
      )}

      {/* Show survey questions if available */}
      {activity.type === "survey" && activity.surveyQuestions && activity.surveyQuestions.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.03em", marginBottom: 6 }}>
            Preview: Survey Questions
          </div>
          {activity.surveyQuestions.map((q: any, i: number) => (
            <SurveyQuestionCard key={i} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main renderer ─── */

export function ArtifactRenderer({ artifact }: { artifact: ArtifactSpec }) {
  switch (artifact.kind) {
    case "idea_board":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.summary}</p>

          <div className="mini-list" style={{ marginTop: 12 }}>
            {artifact.ideas.map((idea, idx) => (
              <div key={idea.title} className="mini-item" style={{ padding: 16 }}>
                {/* Header: number + program name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <strong style={{ fontSize: "1rem" }}>{idea.title}</strong>
                    <div style={{ fontSize: "0.82rem", color: "var(--accent-strong)" }}>{idea.programName}</div>
                  </div>
                </div>

                {/* Premise */}
                <div style={{ marginBottom: 10, fontSize: "0.92rem", lineHeight: 1.5 }}>{idea.premise}</div>

                {/* Why it could work */}
                <div style={{
                  padding: "8px 12px", borderRadius: 12,
                  background: "rgba(38,107,79,0.06)", border: "1px solid rgba(38,107,79,0.12)",
                  marginBottom: 10, fontSize: "0.88rem",
                }}>
                  <strong style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--accent-strong)", letterSpacing: "0.03em" }}>
                    Why this could work
                  </strong>
                  <div style={{ marginTop: 4 }}>{idea.whyItCouldWork}</div>
                </div>

                {/* Data support */}
                <div style={{
                  padding: "8px 12px", borderRadius: 12,
                  background: "rgba(74,144,217,0.06)", border: "1px solid rgba(74,144,217,0.12)",
                  marginBottom: 10, fontSize: "0.88rem",
                }}>
                  <strong style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#4A90D9", letterSpacing: "0.03em" }}>
                    📊 Data support
                  </strong>
                  <div style={{ marginTop: 4 }}>{idea.dataSupport}</div>
                </div>

                {/* Challenges */}
                <div style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.03em", display: "block", marginBottom: 6 }}>
                    ⚠️ Challenges to consider
                  </strong>
                  {idea.challenges.map((c) => (
                    <div key={c} style={{ display: "flex", gap: 6, fontSize: "0.86rem", marginBottom: 3, color: "var(--muted)" }}>
                      <span style={{ flexShrink: 0 }}>·</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Format & duration pills */}
                <div className="pill-row" style={{ marginTop: 0 }}>
                  <span className="pill">📋 {idea.suggestedFormat}</span>
                  <span className="pill">⏱ {idea.duration}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Follow-up question */}
          {artifact.followUpQuestion && (
            <div style={{
              marginTop: 14, padding: "12px 16px", borderRadius: 16,
              background: "rgba(217,140,61,0.08)", border: "1px solid rgba(217,140,61,0.15)",
              fontSize: "0.92rem", fontWeight: 600,
            }}>
              👉 {artifact.followUpQuestion}
            </div>
          )}
        </article>
      );

    case "program_calendar":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.objective} Cadence: {artifact.cadence}</p>
          <div className="mini-list">
            {artifact.days.map((day) => (
              <div key={day.dayLabel} className="mini-item">
                <strong>{day.dayLabel}</strong> · {day.theme}
                <div className="muted" style={{ margin: "6px 0 4px" }}>{day.focus}</div>
                {day.activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ))}
          </div>
        </article>
      );

    case "comms_plan":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <div className="pill-row" style={{ marginBottom: 16 }}>
            {artifact.channelsUsed.map((channel) => (
              <ChannelBadge key={channel} channel={channel} />
            ))}
          </div>

          {/* Group by phase */}
          {(["before", "during", "after"] as const).map((phase) => {
            const phaseMessages = artifact.messages.filter((m) => m.phase === phase);
            if (phaseMessages.length === 0) return null;

            const phaseLabel = { before: "Before Program", during: "During Program", after: "After Program" }[phase];
            const phaseEmoji = { before: "📣", during: "⚡", after: "🎉" }[phase];

            return (
              <div key={phase} style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  padding: "8px 14px",
                  borderRadius: 14,
                  background: "rgba(38,107,79,0.06)",
                  border: "1px solid rgba(38,107,79,0.12)",
                }}>
                  <span style={{ fontSize: "1.1rem" }}>{phaseEmoji}</span>
                  <strong style={{ fontSize: "0.92rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    {phaseLabel}
                  </strong>
                </div>

                {phaseMessages.map((message) => (
                  <div key={message.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <ChannelBadge channel={message.channel} />
                      <span className="muted" style={{ fontSize: "0.82rem" }}>{message.sendOffset}</span>
                      <span className="pill" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                        {message.importance}
                      </span>
                    </div>
                    <div className="muted" style={{ fontSize: "0.84rem", marginBottom: 6 }}>{message.purpose}</div>
                    <ChannelMessagePreview
                      channel={message.channel}
                      copy={message.draftCopy}
                      purpose={message.purpose}
                    />
                    <div className="muted" style={{ fontSize: "0.8rem", marginTop: 6, fontStyle: "italic" }}>
                      {message.rationale}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </article>
      );

    case "table_report":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.summary}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {artifact.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {artifact.rows.map((row, index) => (
                  <tr key={`${artifact.id}-${index}`}>
                    {artifact.columns.map((column) => (
                      <td key={`${column}-${index}`}>{String(row[column] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      );

    case "chart_report":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.summary}</p>
          {artifact.charts.map((chart) => {
            const max = Math.max(...chart.series.map((item) => item.value), 1);
            return (
              <div key={chart.id} className="mini-item">
                <strong>{chart.title}</strong>
                <div className="muted" style={{ marginTop: 6 }}>{chart.summary}</div>
                <div className="chart-bars">
                  {chart.series.map((point) => (
                    <div
                      key={point.label}
                      className="chart-bar"
                      style={{ height: `${(point.value / max) * 140 + 24}px` }}
                    >
                      <span>{point.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pill-row">
                  {chart.series.map((point) => (
                    <span key={point.label} className="pill">{point.label}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </article>
      );

    case "kpi_dashboard":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.summary}</p>

          {/* KPI cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
            {artifact.kpis.map((kpi) => {
              const dirColor = kpi.changeDirection === "up" ? "var(--accent)" : kpi.changeDirection === "down" ? "var(--danger)" : "var(--muted)";
              const dirArrow = kpi.changeDirection === "up" ? "↑" : kpi.changeDirection === "down" ? "↓" : "→";
              return (
                <div
                  key={kpi.label}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: "1px solid var(--line)",
                    background: "rgba(255,255,255,0.8)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 4 }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--ink)" }}>
                    {kpi.value}
                  </div>
                  {kpi.change && (
                    <div style={{ fontSize: "0.82rem", color: dirColor, fontWeight: 600, marginTop: 2 }}>
                      {dirArrow} {kpi.change}
                    </div>
                  )}
                  {kpi.source && (
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>{kpi.source}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Insights list */}
          {artifact.insights.length > 0 && (
            <div>
              <strong style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.03em" }}>
                Key Insights
              </strong>
              <div className="mini-list" style={{ marginTop: 8 }}>
                {artifact.insights.map((insight, i) => (
                  <div key={i} className="mini-item" style={{ display: "flex", gap: 8, fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      );

    case "slides_report":
      return (
        <article className="artifact-card">
          <h3>{artifact.title}</h3>
          <p className="muted">{artifact.summary}</p>
          <div className="artifact-grid">
            {artifact.slides.map((slide, index) => (
              <div key={`${slide.headline}-${index}`} className="mini-item">
                <strong style={{ display: "block", marginBottom: 8 }}>{slide.headline}</strong>
                <div className="muted" style={{ marginBottom: 8 }}>{slide.body}</div>
                <div className="mini-list">
                  {slide.bullets.map((bullet) => (
                    <div key={bullet}>{bullet}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      );
  }
}
