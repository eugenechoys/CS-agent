"use client";

import { useState } from "react";
import { SAMPLE_DATASETS } from "@/lib/data/sample-datasets";
import Link from "next/link";

export default function RawDataPage() {
  const [selectedKey, setSelectedKey] = useState(SAMPLE_DATASETS[0].key);
  const dataset = SAMPLE_DATASETS.find((d) => d.key === selectedKey) ?? SAMPLE_DATASETS[0];

  return (
    <main className="container" style={{ padding: "24px 0 40px" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" className="button-ghost" style={{ textDecoration: "none" }}>
          Home
        </Link>
        <Link href="/copilot" className="button-ghost" style={{ textDecoration: "none" }}>
          Copilot
        </Link>
      </div>

      <section className="surface" style={{ padding: 28, marginBottom: 20 }}>
        <span className="eyebrow">Raw Data</span>
        <h1 className="landing-hero-title" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>
          Browse all datasets
        </h1>
        <p className="muted" style={{ maxWidth: 600, margin: "0 0 20px" }}>
          These are the sample datasets the AI agent can analyze. Pick one to see every row and column.
        </p>

        {/* Dataset selector tabs */}
        <div className="artifact-tabs" style={{ marginBottom: 0 }}>
          {SAMPLE_DATASETS.map((d) => (
            <button
              key={d.key}
              className={`artifact-tab ${d.key === selectedKey ? "active" : ""}`}
              onClick={() => setSelectedKey(d.key)}
              type="button"
            >
              {d.name}
            </button>
          ))}
        </div>
      </section>

      {/* Dataset detail card */}
      <section className="surface" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-heading), sans-serif", fontSize: "1.6rem" }}>
              {dataset.name}
            </h2>
            <p className="muted" style={{ margin: 0 }}>{dataset.description}</p>
          </div>
          <div className="pill-row" style={{ marginTop: 0, flexShrink: 0 }}>
            <span className="pill">{dataset.rows.length} rows</span>
            <span className="pill">{dataset.columns.length} cols</span>
          </div>
        </div>

        {/* Column list */}
        <div style={{ marginBottom: 16 }}>
          <strong style={{ fontSize: "0.84rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.03em" }}>
            Columns
          </strong>
          <div className="pill-row" style={{ marginTop: 6 }}>
            {dataset.columns.map((col) => (
              <span key={col} className="pill">{col}</span>
            ))}
          </div>
        </div>

        {/* Full data table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                {dataset.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{i + 1}</td>
                  {dataset.columns.map((col) => (
                    <td key={col}>{row[col] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
