import Link from "next/link";

const useCases = [
  { emoji: "💡", title: "Brainstorm Ideas", body: "Not sure where to start? Just describe what you want and get fresh program ideas instantly." },
  { emoji: "📅", title: "Design Programs", body: "Get a full program calendar with activities, polls, games, and communications ready to review." },
  { emoji: "📊", title: "Analyze Data", body: "Upload your wellbeing data or use sample data. See what's working and what needs attention." },
  { emoji: "📋", title: "Build Reports", body: "Turn your data into leadership-ready slides, tables, and charts you can share right away." },
];

const steps = [
  { num: "1", title: "Tell me what you need", body: "Type what you're working on. It can be vague or specific - I'll figure out the best approach." },
  { num: "2", title: "I build it for you", body: "I'll brainstorm, design, analyze, or report - and show you everything as easy-to-review drafts." },
  { num: "3", title: "You review and edit", body: "Everything is a draft. You're always in control. Edit, adjust, and approve before anything goes live." },
];

const concepts = [
  {
    emoji: "🤖",
    title: "What is an Agent?",
    body: "An AI assistant with specific instructions, tools, and a job to do. Think of it like a team member who can think and make decisions - not just follow a script.",
    example: "Bokchoys has 1 master agent + 5 specialist agents",
  },
  {
    emoji: "🧠",
    title: "What is a Skill?",
    body: "Reusable knowledge the agent uses to think better. Like a cheat sheet for how to design programs, plan communications, or analyze data.",
    example: "7 skills: ideation, design, comms, games, analysis, reporting, artifacts",
  },
  {
    emoji: "🔧",
    title: "What is a Tool?",
    body: "Code that does the actual work - building calendars, generating tables, creating charts. The agent decides what to do, the tool does it reliably every time.",
    example: "12 tools: polls, surveys, games, calendars, comms, charts, slides...",
  },
  {
    emoji: "📦",
    title: "What is an Artifact?",
    body: "The visual output you see on the right panel - idea boards, program calendars, comms plans, tables, charts, and slides. Structured and easy to review.",
    example: "6 types: ideas, program, comms, table, chart, slides",
  },
];

const techDetails = [
  { label: "AI Provider", value: "OpenAI (GPT-5.1)" },
  { label: "Agent SDK", value: "OpenAI Agents SDK" },
  { label: "Framework", value: "Next.js + React" },
  { label: "Typing", value: "Zod schemas" },
  { label: "Cost per request", value: "~$0.02-0.08" },
  { label: "Avg response time", value: "3-8 seconds" },
];

export default function HomePage() {
  return (
    <main className="container" style={{ padding: "24px 0 40px" }}>
      {/* Hero */}
      <section className="surface" style={{ padding: "36px 28px", marginBottom: 20 }}>
        <span className="eyebrow">Bokchoys by Choys</span>
        <h1 className="landing-hero-title">Your AI helper for employee wellbeing programs</h1>
        <p className="muted" style={{ fontSize: "1.1rem", maxWidth: 640, margin: "0 0 24px" }}>
          Tell Bokchoys what you need. It brainstorms ideas, designs programs, analyzes data, and creates reports - all as easy-to-review drafts.
        </p>
        <div className="button-row">
          <Link className="button-primary" href="/copilot" style={{ fontSize: "1.05rem", padding: "14px 28px" }}>
            Start chatting
          </Link>
          <Link className="button-ghost" href="/raw-data">
            Browse raw data
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ marginBottom: 20 }}>
        <div className="grid-cards four">
          {useCases.map((item) => (
            <article key={item.title} className="feature-card">
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.emoji}</div>
              <h3 style={{ margin: "0 0 8px" }}>{item.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="surface" style={{ padding: 28, marginBottom: 20 }}>
        <span className="eyebrow">How it works</span>
        <h2 className="landing-section-title">Three simple steps</h2>
        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.num} className="step-card">
              <div className="step-number">{step.num}</div>
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>{step.title}</strong>
                <p className="muted" style={{ margin: 0 }}>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Architecture visualization */}
      <section className="surface" style={{ padding: 28, marginBottom: 20 }}>
        <span className="eyebrow">How Bokchoys thinks</span>
        <h2 className="landing-section-title">The agent architecture</h2>
        <p className="muted" style={{ maxWidth: 600, margin: "0 0 24px" }}>
          One master agent decides the approach. Specialists handle specific domains. Tools build the actual outputs.
        </p>

        {/* Visual architecture diagram */}
        <div className="arch-diagram">
          {/* User input */}
          <div className="arch-node arch-user">
            <div className="arch-icon">👤</div>
            <div className="arch-label">HR User</div>
            <div className="arch-sub">Types a prompt</div>
          </div>

          <div className="arch-arrow">→</div>

          {/* Master agent */}
          <div className="arch-node arch-master">
            <div className="arch-icon">🎯</div>
            <div className="arch-label">Master Agent</div>
            <div className="arch-sub">Decides the approach</div>
            <div className="arch-modes">
              <span className="pill">brainstorm</span>
              <span className="pill">design</span>
              <span className="pill">analyze</span>
              <span className="pill">report</span>
            </div>
          </div>

          <div className="arch-arrow">→</div>

          {/* Specialists */}
          <div className="arch-node arch-specialists">
            <div className="arch-icon">🧠</div>
            <div className="arch-label">Specialist Agents</div>
            <div className="arch-sub">Deep domain thinking</div>
            <div className="arch-grid-small">
              <span className="arch-chip">Strategist</span>
              <span className="arch-chip">Designer</span>
              <span className="arch-chip">Comms</span>
              <span className="arch-chip">Analyst</span>
              <span className="arch-chip">Reporter</span>
            </div>
          </div>

          <div className="arch-arrow">→</div>

          {/* Tools + Artifacts */}
          <div className="arch-node arch-tools">
            <div className="arch-icon">🔧</div>
            <div className="arch-label">Tools + Artifacts</div>
            <div className="arch-sub">Build the outputs</div>
            <div className="arch-grid-small">
              <span className="arch-chip">📊 Polls</span>
              <span className="arch-chip">📝 Surveys</span>
              <span className="arch-chip">🎮 Games</span>
              <span className="arch-chip">📅 Calendar</span>
              <span className="arch-chip">💬 Comms</span>
              <span className="arch-chip">📈 Charts</span>
            </div>
          </div>
        </div>

        {/* Skills bar */}
        <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 18, border: "1px solid var(--line)", background: "rgba(38,107,79,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span>📚</span>
            <strong style={{ fontSize: "0.88rem" }}>Skills (shared knowledge)</strong>
          </div>
          <div className="pill-row" style={{ marginTop: 0 }}>
            <span className="pill">Wellbeing Ideation</span>
            <span className="pill">Engagement Design</span>
            <span className="pill">Comms Strategy</span>
            <span className="pill">Game Selection</span>
            <span className="pill">Data Analysis</span>
            <span className="pill">Executive Reporting</span>
            <span className="pill">Artifact Composition</span>
          </div>
        </div>
      </section>

      {/* Concepts explainer */}
      <section style={{ marginBottom: 20 }}>
        <div className="grid-cards four">
          {concepts.map((item) => (
            <article key={item.title} className="feature-card">
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.emoji}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>{item.title}</h3>
              <p className="muted" style={{ margin: "0 0 10px", fontSize: "0.92rem" }}>{item.body}</p>
              <div className="pill" style={{ fontSize: "0.78rem" }}>{item.example}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── For Engineers: How it actually works ─── */}
      <section className="surface" style={{ padding: 28, marginBottom: 20 }}>
        <span className="eyebrow">For Engineers</span>
        <h2 className="landing-section-title">How the agent system works</h2>
        <p className="muted" style={{ maxWidth: 700, margin: "0 0 24px" }}>
          This is how Bokchoys processes every request under the hood. Understanding this helps you debug, improve prompts, and extend the system.
        </p>

        {/* Memory & Context */}
        <div className="grid-cards" style={{ marginBottom: 20 }}>
          <article className="feature-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🧠</div>
            <h3 style={{ margin: "0 0 6px" }}>Memory (current: in-memory)</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: "0.9rem" }}>
              <strong>What:</strong> How the agent remembers things between messages.<br />
              <strong>Right now:</strong> Chat history is passed as a transcript string on every request. Datasets live in a server-side <code>Map</code> (lost on restart). No persistent memory yet.<br />
              <strong>Next:</strong> Database-backed sessions, user preferences, program history.
            </p>
            <div className="pill" style={{ fontSize: "0.78rem" }}>lib/store/memory.ts</div>
          </article>

          <article className="feature-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📋</div>
            <h3 style={{ margin: "0 0 6px" }}>Context (what the agent sees)</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: "0.9rem" }}>
              <strong>What:</strong> Everything the agent receives before it thinks.<br />
              <strong>Right now:</strong> System prompt + intent signal + dataset catalog (all 12 tables with columns/rows) + chat history + structured output hint.<br />
              <strong>Key file:</strong> <code>run-master-agent.ts</code> builds the transcript with <code>[SYSTEM CONTEXT]</code> blocks.
            </p>
            <div className="pill" style={{ fontSize: "0.78rem" }}>lib/agents/run-master-agent.ts</div>
          </article>

          <article className="feature-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🔀</div>
            <h3 style={{ margin: "0 0 6px" }}>Routing (how it decides)</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: "0.9rem" }}>
              <strong>Step 1:</strong> Keyword classifier picks an intent signal (brainstorm/design/analyze/report).<br />
              <strong>Step 2:</strong> Master agent receives the signal but makes its own decision.<br />
              <strong>Step 3:</strong> Master calls specialist agents as tools via OpenAI SDK <code>.asTool()</code>.<br />
              <strong>Step 4:</strong> Deterministic tools build typed artifacts from agent output.
            </p>
            <div className="pill" style={{ fontSize: "0.78rem" }}>lib/agents/intent.ts + master.ts</div>
          </article>
        </div>

        {/* Code walkthrough */}
        <div style={{ padding: 20, borderRadius: 20, border: "1px solid var(--line)", background: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px" }}>Request lifecycle (code path)</h3>
          <div className="mini-list">
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>1.</strong> POST /api/chat → <code>route.ts</code> validates with Zod, calls <code>runMasterAgent()</code>
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>2.</strong> <code>classifyIntent(message)</code> → keyword match → intent signal (hint, not final)
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>3.</strong> <code>ensureAllSampleDatasetsLoaded()</code> → loads 12 datasets into memory Map
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>4.</strong> Build transcript: [SYSTEM CONTEXT] + dataset catalog + chat history + output hint
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>5.</strong> <code>run(agent, transcript, context)</code> → OpenAI Agents SDK executes master agent
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>6.</strong> Master may call specialists via <code>.asTool()</code> (strategist, designer, analyst, etc.)
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>7.</strong> <code>AgentChatOutputSchema.parse(result)</code> → validates structured output
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>8.</strong> <code>buildArtifacts()</code> → uses agent content if provided, else falls back to templates
            </div>
            <div className="mini-item" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <strong>9.</strong> Return <code>ChatResponse</code> with message + artifacts + trace → UI renders
            </div>
          </div>
        </div>

        {/* Key files reference */}
        <div style={{ padding: 20, borderRadius: 20, border: "1px solid var(--line)", background: "rgba(255,255,255,0.7)" }}>
          <h3 style={{ margin: "0 0 12px" }}>Key files to know</h3>
          <div className="grid-cards" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[
              { file: "lib/agents/master.ts", desc: "Creates master agent with GPT-5.1, connects 5 specialists as tools" },
              { file: "lib/agents/specialists.ts", desc: "Creates 5 specialist agents, each with their own prompt and tools" },
              { file: "lib/agents/run-master-agent.ts", desc: "Main orchestration: builds context, runs agent, assembles artifacts" },
              { file: "lib/agents/intent.ts", desc: "Simple keyword classifier (hint signal, not final decision)" },
              { file: "lib/schemas/bokchoys.ts", desc: "All Zod schemas: artifacts, agent output, chat messages" },
              { file: "lib/tools/multi-analysis.ts", desc: "Cross-dataset query engine: scores relevance, combines findings" },
              { file: "lib/prompts/load-prompt.ts", desc: "Prompt loader: reads markdown, extracts code blocks, caches" },
              { file: "lib/store/memory.ts", desc: "In-memory store for datasets and artifacts (no persistence yet)" },
            ].map((item) => (
              <div key={item.file} style={{ padding: 10, borderRadius: 12, border: "1px solid var(--line)", background: "rgba(255,255,255,0.5)" }}>
                <code style={{ fontSize: "0.82rem", color: "var(--accent-strong)" }}>{item.file}</code>
                <div className="muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech details bar */}
      <section className="surface" style={{ padding: 28 }}>
        <span className="eyebrow">Under the hood</span>
        <h2 className="landing-section-title">Tech stack</h2>
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
          {techDetails.map((item) => (
            <div key={item.label} style={{ textAlign: "center", padding: 12 }}>
              <div className="muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                {item.label}
              </div>
              <strong style={{ fontSize: "0.95rem" }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
