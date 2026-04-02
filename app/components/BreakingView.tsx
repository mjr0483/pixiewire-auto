"use client";

import { useState, useEffect } from "react";
import NavPills from "./NavPills";

interface MonitorItem {
  id: string;
  topic: string;
  type: string;
  text: string;
  source_url: string | null;
  status: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function BreakingView() {
  const [findings, setFindings] = useState<MonitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchFindings = () => {
    fetch("/api/x-poster/monitor")
      .then((r) => r.json())
      .then((data) => {
        setFindings(data.findings || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchFindings(); }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchFindings, 60000);
    return () => clearInterval(interval);
  }, []);

  const runManualScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/x-poster/monitor", {
        method: "POST",
        headers: { "Authorization": "Bearer manual-test" },
      });
      const data = await res.json();
      if (data.ok) {
        setScanResult(data.found > 0 ? `Found ${data.found} potential breaking stories` : "No breaking news detected");
      } else {
        setScanResult(data.error || "Scan failed");
      }
      fetchFindings();
    } catch (e) {
      setScanResult((e as Error).message);
    }
    setScanning(false);
  };

  const monitorItems = findings.filter((f) => f.status === "monitor");
  const dismissedItems = findings.filter((f) => f.status === "skipped");

  return (
    <>
      <div className="header">
        <h1>Breaking News</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* Cron status */}
        <div className="xp-section">
          <h2>Monitor Status</h2>
          <div className="xp-status-grid">
            <div className="xp-stat">
              <div className="xp-stat-label">Mode</div>
              <div className="xp-stat-value" style={{ color: "var(--gold)" }}>Monitor Only</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Cron Schedule</div>
              <div className="xp-stat-value" style={{ fontSize: 14 }}>Every 15 min via n8n</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Pending Review</div>
              <div className="xp-stat-value">{monitorItems.length}</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Dismissed</div>
              <div className="xp-stat-value" style={{ color: "var(--muted)" }}>{dismissedItems.length}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <button className="xp-btn xp-btn-primary" onClick={runManualScan} disabled={scanning}>
              {scanning ? "Scanning..." : "Run Manual Scan"}
            </button>
            {scanResult && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: scanResult.includes("Found") ? "var(--success)" : "var(--muted)" }}>
                {scanResult}
              </span>
            )}
          </div>

          <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--paper)", borderRadius: 8, fontSize: 12 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
              How it works
            </span>
            <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>
              Searches X every 15 minutes for Disney/theme park tweets with high engagement (50+ likes or 20+ retweets).
              Findings are logged here for your review. Nothing is auto-posted — you approve each breaking tweet.
              Requires X API Basic tier for search. Free tier will show an error message.
            </div>
          </div>
        </div>

        {/* Findings for review */}
        <div className="xp-section">
          <h2>Pending Review ({monitorItems.length})</h2>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading...</div>
          ) : monitorItems.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
              No breaking news items pending review. The monitor will surface items here when it detects significant Disney news.
            </div>
          ) : (
            monitorItems.map((item) => (
              <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--rule-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 4 }}>{item.text}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--muted)" }}>
                      <span style={{ fontFamily: "var(--mono)" }}>{timeAgo(item.created_at)}</span>
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>view on X</a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="xp-btn xp-btn-danger" onClick={async () => {
                      await fetch("/api/x-poster/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action: "skip" }) });
                      fetchFindings();
                    }} style={{ padding: "6px 12px", fontSize: 10 }}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent dismissed */}
        {dismissedItems.length > 0 && (
          <div className="xp-section">
            <h2>Recently Dismissed</h2>
            {dismissedItems.slice(0, 10).map((item) => (
              <div key={item.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-light)", fontSize: 12, color: "var(--muted)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{timeAgo(item.created_at)}</span>
                {" — "}{item.text?.slice(0, 100)}...
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
