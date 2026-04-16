"use client";

import Link from "next/link";
import { CsTrainerShell } from "@/components/cs-trainer-shell";

export default function CsTrainerPage() {
  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header */}
      <nav style={{
        padding: "10px 20px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
          ← Home
        </Link>
        <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>🎓 AI Trainer</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link className="button-ghost" href="/cs-agent" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
            CS Agent Demo
          </Link>
          <Link className="button-ghost" href="/copilot" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
            HR Copilot
          </Link>
        </div>
      </nav>

      {/* Trainer */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <CsTrainerShell />
      </div>
    </main>
  );
}
