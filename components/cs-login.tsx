"use client";

import { useEffect, useState } from "react";
import type { CsApiEnv } from "@/lib/schemas/cs-schemas";

export function CsLogin({
  onAuthenticated,
  initialEnv = "dev",
}: {
  onAuthenticated: () => void;
  initialEnv?: CsApiEnv;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiEnv, setApiEnv] = useState<CsApiEnv>(initialEnv);

  useEffect(() => {
    setApiEnv(initialEnv);
  }, [initialEnv]);

  async function sendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cs-demo/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), apiEnv }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Failed to send OTP");
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!email.trim() || !otp.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cs-demo/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), apiEnv }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Failed to verify OTP");
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 20px 32px" }}>
      <div className="surface" style={{ padding: "32px 28px" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🔐</div>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.35rem" }}>Connect the demo</h2>
        <p className="muted" style={{ margin: "0 0 24px", fontSize: "0.94rem", lineHeight: 1.6 }}>
          Use the same OTP flow as the insights analysis tool. Once you’re in, you can switch between Employee CS and HR Expert without leaving the page.
        </p>

        <label style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 500 }}>
          Environment
        </label>
        <select
          value={apiEnv}
          onChange={(event) => {
            const nextEnv = event.target.value as CsApiEnv;
            setApiEnv(nextEnv);
            setOtp("");
            setOtpSent(false);
            setError(null);
          }}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            fontSize: "0.95rem",
            outline: "none",
            boxSizing: "border-box",
            background: "#fff",
            marginBottom: 16,
          }}
        >
          <option value="dev">DEV</option>
          <option value="prod">PROD</option>
        </select>

        <label style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 500 }}>
          Work email
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          placeholder="you@getchoys.com"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${error ? "#e53e3e" : "var(--line)"}`,
            fontSize: "0.95rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {!otpSent ? (
          <button
            className="button-primary"
            onClick={sendOtp}
            disabled={loading || !email.trim()}
            style={{ width: "100%", marginTop: 16, padding: "12px 0" }}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <>
            <label style={{ display: "block", margin: "18px 0 6px", fontSize: "0.88rem", fontWeight: 500 }}>
              OTP code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value);
                setError(null);
              }}
              placeholder="Enter the code from your email"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${error ? "#e53e3e" : "var(--line)"}`,
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                className="button-primary"
                onClick={verifyOtp}
                disabled={loading || !otp.trim()}
                style={{ flex: 1, padding: "12px 0" }}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <button
                className="button-ghost"
                onClick={sendOtp}
                disabled={loading}
                style={{ padding: "12px 14px" }}
              >
                Resend
              </button>
            </div>
          </>
        )}

        {error && <p style={{ color: "#e53e3e", fontSize: "0.82rem", margin: "12px 0 0" }}>{error}</p>}
        <p className="muted" style={{ margin: "12px 0 0", fontSize: "0.76rem", lineHeight: 1.5 }}>
          The selected environment applies to OTP login, tenant context loading, and live employee support lookups for this session.
        </p>
      </div>
    </div>
  );
}
