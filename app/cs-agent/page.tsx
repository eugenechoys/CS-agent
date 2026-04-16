"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CsLogin } from "@/components/cs-login";
import { CsChatShell } from "@/components/cs-chat-shell";
import { CsWorkflowPanel } from "@/components/cs-workflow-panel";
import type { CsAgentMode, CsApiEnv, CsDemoContextResponse } from "@/lib/schemas/cs-schemas";

const modeOptions: { value: CsAgentMode; label: string; description: string }[] = [
  {
    value: "employee-cs",
    label: "Employee CS",
    description: "Support mode for employee questions, benefits, insurance, and selected-user context.",
  },
  {
    value: "hr-expert",
    label: "HR Expert",
    description: "Selling mode for HR buyers, demo storytelling, and proof-point conversations.",
  },
];

export default function CsAgentPage() {
  const [context, setContext] = useState<CsDemoContextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [mode, setMode] = useState<CsAgentMode>("employee-cs");
  const [tenantId, setTenantId] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [apiEnv, setApiEnv] = useState<CsApiEnv>("dev");
  const contextRequestIdRef = useRef(0);

  const loadContext = useCallback(async (nextTenantId?: string) => {
    const requestId = ++contextRequestIdRef.current;
    if (nextTenantId) {
      setTenantLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await fetch(
        `/api/cs-demo/context${nextTenantId ? `?tenantId=${encodeURIComponent(nextTenantId)}` : ""}`,
      );
      const payload: CsDemoContextResponse = await response.json();
      if (requestId !== contextRequestIdRef.current) {
        return;
      }

      setContext(payload);
      setApiEnv(payload.apiEnv ?? "dev");

      const fallbackTenantId = nextTenantId || payload.tenants[0]?.id || "";
      setTenantId(fallbackTenantId);

      if (mode === "employee-cs") {
        const availableUsers = payload.users;
        setUserId((current) => (
          nextTenantId ? (availableUsers[0]?.id || "") : (availableUsers.some((user) => user.id === current) ? current : availableUsers[0]?.id || "")
        ));
      } else {
        setUserId("");
      }
    } finally {
      if (requestId === contextRequestIdRef.current) {
        setLoading(false);
        setTenantLoading(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const selectedTenant = useMemo(
    () => context?.tenants.find((tenant) => tenant.id === tenantId) ?? context?.tenants[0],
    [context, tenantId],
  );
  const selectedUser = useMemo(
    () => context?.users.find((user) => user.id === userId),
    [context, userId],
  );

  useEffect(() => {
    if (selectedTenant && selectedTenant.id !== tenantId) {
      setTenantId(selectedTenant.id);
    }
  }, [selectedTenant, tenantId]);

  async function handleTenantChange(nextTenantId: string) {
    setTenantId(nextTenantId);
    setUserId("");
    await loadContext(nextTenantId);
  }

  async function logout() {
    await fetch("/api/cs-demo/auth/logout", { method: "POST" }).catch(() => undefined);
    setContext(null);
    setTenantId("");
    setUserId("");
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ fontSize: "0.88rem", color: "var(--muted)", textDecoration: "none" }}>
          ← Home
        </Link>
        <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>CHOYS Demo</span>
        <Link className="button-ghost" href="/cs-agent" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
          CS Demo
        </Link>
        <Link className="button-ghost" href="/cs-trainer" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
          AI Trainer
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {context?.authenticated ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "rgba(38,107,79,0.05)",
                fontSize: "0.8rem",
              }}
            >
              <span className="muted">Environment</span>
              <strong>{apiEnv.toUpperCase()}</strong>
            </div>
          ) : null}
          {context?.authenticated ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "rgba(38,107,79,0.05)",
                fontSize: "0.8rem",
              }}
            >
              <span className="muted">Auth mode</span>
              <strong>{context.authMode}</strong>
            </div>
          ) : null}
          {context?.authenticated ? (
            <button
              className="button-primary"
              onClick={logout}
              style={{ fontSize: "0.82rem", padding: "8px 16px", whiteSpace: "nowrap" }}
            >
              Log out / switch account
            </button>
          ) : null}
        </div>
      </nav>

      <div className="container" style={{ padding: "24px 0 32px" }}>
        <section className="surface" style={{ padding: "30px 28px", marginBottom: 20 }}>
          <span className="eyebrow">Multi-Mode CS Demo</span>
          <h1 className="landing-hero-title" style={{ marginBottom: 12 }}>
            One shell, two agent modes, easy switching
          </h1>
          <p className="muted" style={{ maxWidth: 760, margin: "0 0 20px", fontSize: "1rem", lineHeight: 1.65 }}>
            Start in the CS demo, switch between Employee CS and HR Expert instantly, and use the AI Trainer when you want to update shared knowledge or mode prompts. The goal is to make the demo fast to explain and even easier to test internally.
          </p>
          <div className="button-row">
            <Link className="button-primary" href="/cs-agent">
              Open CS Demo
            </Link>
            <Link className="button-ghost" href="/cs-trainer">
              Open AI Trainer
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="surface" style={{ padding: 28 }}>
            <p className="muted" style={{ margin: 0 }}>Loading CS demo context...</p>
          </div>
        ) : !context?.authenticated ? (
          <CsLogin
            initialEnv={apiEnv}
            onAuthenticated={() => void loadContext()}
          />
        ) : (
          <div className="cs-demo-layout">
            <section className="surface" style={{ minHeight: "72vh", overflow: "hidden" }}>
              <CsChatShell
                mode={mode}
                tenantId={selectedTenant?.id || tenantId}
                tenantName={selectedTenant?.name}
                userId={mode === "employee-cs" && !tenantLoading ? selectedUser?.id || userId || undefined : undefined}
                userName={mode === "employee-cs" && !tenantLoading ? selectedUser?.name : "Loading users..."}
              />
            </section>

            <aside className="cs-demo-sidebar">
              <div className="surface" style={{ padding: 18 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Context</div>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600 }}>
                      Agent mode
                    </label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {modeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMode(option.value)}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: mode === option.value ? "1px solid var(--accent-strong)" : "1px solid var(--line)",
                            background: mode === option.value ? "rgba(38,107,79,0.08)" : "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <strong style={{ display: "block", fontSize: "0.88rem" }}>{option.label}</strong>
                          <span className="muted" style={{ fontSize: "0.76rem", lineHeight: 1.45 }}>
                            {option.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600 }}>
                      Tenant
                    </label>
                    <select
                      value={selectedTenant?.id || tenantId}
                      onChange={(event) => void handleTenantChange(event.target.value)}
                      disabled={tenantLoading}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        fontSize: "0.88rem",
                        background: "#fff",
                      }}
                    >
                      {context.tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                          {tenant.isCurrent ? " (Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {mode === "employee-cs" ? (
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600 }}>
                        Selected user
                      </label>
                      <select
                        value={tenantLoading ? "" : selectedUser?.id || userId}
                        onChange={(event) => setUserId(event.target.value)}
                        disabled={tenantLoading}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: "1px solid var(--line)",
                          fontSize: "0.88rem",
                          background: "#fff",
                        }}
                      >
                        <option value="">{tenantLoading ? "Loading users..." : "No user selected"}</option>
                        {context.users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                            {user.jobTitle ? ` · ${user.jobTitle}` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.76rem", lineHeight: 1.45 }}>
                        {tenantLoading
                          ? "Refreshing tenant users for the selected tenant..."
                          : "Personal support lookups use the currently selected employee. Leave it blank for general CHOYS questions."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(38,107,79,0.04)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                      HR Expert mode stays sales-focused and does not use personal employee data.
                    </div>
                  )}
                </div>
              </div>

              <CsWorkflowPanel mode={mode} />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
