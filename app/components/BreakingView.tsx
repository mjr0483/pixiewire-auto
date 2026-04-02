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

export default function BreakingView() {
  const [findings, setFindings] = useState<MonitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitorActive, setMonitorActive] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchFindings = () => {
    fetch("/api/x-poster/monitor")
      .then((r) => r.json())
      .then((data) => { setFindings(data.findings || []); setLoading(false); });
  };

  const fetchToggleState = () => {
    fetch("/api/x-poster/monitor-toggle")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setMonitorActive(data.active); });
  };

  useEffect(() => { fetchFindings(); fetchToggleState(); }, []);
  useEffect(() => {
    const interval = setInterval(fetchFindings, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleMonitor = async () => {
    setToggling(true);
    const res = await fetch("/api/x-poster/monitor-toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !monitorActive }),
    });
    const data = await res.json();
    if (data.ok) setMonitorActive(data.active);
    setToggling(false);
  };

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
        {/* Big clear ON/OFF banner */}
        <div className="xp-section" style={{
          background: monitorActive ? "var(--success-soft)" : "var(--paper)",
          border: monitorActive ? "2px solid var(--success)" : "2px solid var(--rule)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: monitorActive ? "var(--success)" : "var(--muted)" }}>
                {monitorActive === null ? "Loading..." : monitorActive ? "MONITOR IS ON" : "MONITOR IS OFF"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {monitorActive ? "Scanning X for breaking Disney news every 15 minutes" : "Breaking news scanning is disabled"}
              </div>
            </div>
            <button
              onClick={toggleMonitor}
              disabled={toggling || monitorActive === null}
              className="xp-btn"
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 10,
                background: monitorActive ? "var(--accent)" : "var(--success)",
                color: "white", border: "none",
              }}
            >
              {toggling ? "..." : monitorActive ? "Turn Off" : "Turn On"}
            </button>
          </div>
        </div>

        <div className="xp-section">
          <h2>Status</h2>
          <div className="xp-status-grid">
            <div className="xp-stat">
              <div className="xp-stat-label">Schedule</div>
              <div className="xp-stat-value" style={{ fontSize: 14 }}>Every 15 min</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Pending Review</div>
              <div className="xp-stat-value">{monitorItems.length}</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Dismissed</div>
              <div className="xp-stat-value" style={{ color: "var(--muted)" }}>{dismissedItems.length}</div>
            </div>
            <div className="xp-stat">
              <div className="xp-stat-label">Cost</div>
              <div className="xp-stat-value" style={{ fontSize: 14 }}>X API search</div>
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
              When active, searches X every 15 minutes for Disney/theme park tweets with high engagement.
              Findings are logged here for your review. Nothing is auto-posted.
              Uses X API search (requires Basic tier). Pushover alert on new findings.
            </div>
          </div>
        </div>

        <div className="xp-section">
          <h2>Pending Review ({monitorItems.length})</h2>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading...</div>
          ) : monitorItems.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
              No breaking news items pending review.
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
                  <button className="xp-btn xp-btn-danger" onClick={async () => {
                    await fetch("/api/x-poster/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action: "skip" }) });
                    fetchFindings();
                  }} style={{ padding: "6px 12px", fontSize: 10 }}>Dismiss</button>
                </div>
              </div>
            ))
          )}
        </div>

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
