"use client";

import { useState, useEffect } from "react";

const HASH = "88e050b5bc5a6d1cd014b03f00ff7d3bb9ca1ed8f0f0e8f8eccef09c8208886e";

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthed(sessionStorage.getItem("pw_auth") === "1");
    setChecked(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hash === HASH) {
      sessionStorage.setItem("pw_auth", "1");
      setAuthed(true);
    } else {
      setError("Wrong password");
      (form.elements.namedItem("password") as HTMLInputElement).value = "";
      (form.elements.namedItem("password") as HTMLInputElement).focus();
    }
  }

  return (
    <>
      {children}
      {checked && !authed && (
        <div style={{
          position: "fixed", inset: 0, background: "var(--paper)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: "100%", maxWidth: 300, padding: "0 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--sans)", fontSize: 24, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>PixieWire</div>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "var(--muted)", marginBottom: 28,
            }}>Auto</div>
            <form onSubmit={handleSubmit} autoComplete="on" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="text"
                name="username"
                autoComplete="username"
                placeholder="Username"
                style={{
                  fontFamily: "var(--sans)", fontSize: 15, padding: "12px 14px",
                  border: "1px solid var(--rule)", borderRadius: 8, background: "var(--card)",
                  color: "var(--ink)", outline: "none", width: "100%",
                }}
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                style={{
                  fontFamily: "var(--sans)", fontSize: 15, padding: "12px 14px",
                  border: "1px solid var(--rule)", borderRadius: 8, background: "var(--card)",
                  color: "var(--ink)", outline: "none", width: "100%",
                }}
              />
              <button type="submit" style={{
                fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                padding: 13, border: "none", borderRadius: 8, background: "var(--ink)", color: "var(--paper)", cursor: "pointer",
              }}>Sign In</button>
              {error && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{error}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
