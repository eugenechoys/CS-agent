import Link from "next/link";

const cards = [
  {
    title: "CS Demo",
    body: "Jump into the multi-mode support demo. Switch between Employee CS and HR Expert, pick a tenant, and optionally pick a user for personal support questions.",
    href: "/cs-agent",
    cta: "Open CS Demo",
  },
  {
    title: "AI Trainer",
    body: "Update shared knowledge, employee-mode prompts, HR Expert proof points, and specific support guidance without touching tool code.",
    href: "/cs-trainer",
    cta: "Open AI Trainer",
  },
  {
    title: "HR Copilot",
    body: "Use the original Bokchoys copilot for brainstorming programs, analyzing datasets, and generating artifacts.",
    href: "/copilot",
    cta: "Open Copilot",
  },
];

export default function HomePage() {
  return (
    <main className="container" style={{ padding: "28px 0 40px" }}>
      <section className="surface" style={{ padding: "38px 30px", marginBottom: 20 }}>
        <span className="eyebrow">Bokchoys by Choys</span>
        <h1 className="landing-hero-title" style={{ marginBottom: 12 }}>
          Internal demo hub for CS agents and trainer workflows
        </h1>
        <p className="muted" style={{ fontSize: "1.02rem", maxWidth: 720, margin: "0 0 22px", lineHeight: 1.7 }}>
          Start with the CS Demo if you want to test the new multi-mode support experience. Open the AI Trainer when you want to change knowledge or prompts. Both flows are one click away.
        </p>
        <div className="button-row">
          <Link className="button-primary" href="/cs-agent">
            Open CS Demo
          </Link>
          <Link className="button-ghost" href="/cs-trainer">
            Open AI Trainer
          </Link>
          <Link className="button-ghost" href="/copilot">
            Open HR Copilot
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div className="grid-cards three">
          {cards.map((card) => (
            <article key={card.title} className="feature-card">
              <h2 style={{ margin: "0 0 10px", fontSize: "1.1rem" }}>{card.title}</h2>
              <p className="muted" style={{ margin: "0 0 16px", fontSize: "0.94rem", lineHeight: 1.65 }}>
                {card.body}
              </p>
              <Link className="button-ghost" href={card.href}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="surface" style={{ padding: 24 }}>
        <span className="eyebrow">What changed</span>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Two clear agent modes</strong>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              Employee CS handles selected-employee support questions, while HR Expert stays sales-focused for demos and buyer conversations.
            </span>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Tenant-aware support context</strong>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              The demo now carries mode, tenant, and optional user context through the backend so support answers can stay scoped and traceable.
            </span>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Trainer-ready prompt structure</strong>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              Shared knowledge, mode-specific prompts, and specific live-data guidance now live in separate directories for cleaner editing and stronger infrastructure.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
