"use client";

import { useState, useEffect } from "react";
import NavPills from "./NavPills";

interface AgentRun {
  id: string;
  agent: string;
  slot: string | null;
  content_type: string | null;
  status: string;
  duration_ms: number | null;
  tweet_text: string | null;
  tweet_id: string | null;
  tweet_url: string | null;
  error: string | null;
  details: any;
  created_at: string;
}

interface Stats {
  total_today: number;
  success_today: number;
  failed_today: number;
  skipped_today: number;
  avg_duration_ms: number;
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

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AgentView() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRuns = () => {
    const url = filterAgent === "all" ? "/api/x-poster/agent-runs?limit=100" : `/api/x-poster/agent-runs?limit=100&agent=${filterAgent}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setRuns(data.runs || []);
          setStats(data.stats || null);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchRuns(); }, [filterAgent]);
  useEffect(() => {
    const interval = setInterval(fetchRuns, 30000);
    return () => clearInterval(interval);
  }, [filterAgent]);

  const agents = [...new Set(runs.map((r) => r.agent))].sort();

  return (
    <>
      <div className="header">
        <h1>Agent Dashboard</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* Today's stats */}
        <div className="xp-section">
          <h2>Today</h2>
          {loading ? (
            <div style={{ color: "var(--muted)", padding: 20, textAlign: "center" }}>Loading...</div>
          ) : stats ? (
            <div className="xp-status-grid">
              <div className="xp-stat">
                <div className="xp-stat-label">Runs</div>
                <div className="xp-stat-value">{stats.total_today}</div>
              </div>
              <div className="xp-stat">
                <div className="xp-stat-label">Success</div>
                <div className="xp-stat-value" style={{ color: "var(--success)" }}>{stats.success_today}</div>
              </div>
              <div className="xp-stat">
                <div className="xp-stat-label">Failed</div>
                <div className="xp-stat-value" style={{ color: stats.failed_today > 0 ? "var(--accent)" : "var(--muted)" }}>{stats.failed_today}</div>
              </div>
              <div className="xp-stat">
                <div className="xp-stat-label">Avg Duration</div>
                <div className="xp-stat-value" style={{ fontSize: 14 }}>{formatDuration(stats.avg_duration_ms)}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Filter */}
        <div className="xp-section">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>Filter:</span>
            <button onClick={() => setFilterAgent("all")} className={filterAgent === "all" ? "xp-pill xp-pill-active" : "xp-pill"} style={{ fontSize: 11, padding: "4px 12px" }}>All</button>
            <button onClick={() => setFilterAgent("tweeter")} className={filterAgent === "tweeter" ? "xp-pill xp-pill-active" : "xp-pill"} style={{ fontSize: 11, padding: "4px 12px" }}>Tweeter</button>
            <button onClick={() => setFilterAgent("breaking")} className={filterAgent === "breaking" ? "xp-pill xp-pill-active" : "xp-pill"} style={{ fontSize: 11, padding: "4px 12px" }}>Breaking</button>
            <button onClick={() => setFilterAgent("auditor")} className={filterAgent === "auditor" ? "xp-pill xp-pill-active" : "xp-pill"} style={{ fontSize: 11, padding: "4px 12px" }}>Auditor</button>
          </div>

          <h2>Run History</h2>
          {runs.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
              No agent runs recorded yet. Runs will appear here as scheduled tasks fire.
            </div>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-light)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: run.status === "success" ? "var(--success)" : run.status === "error" ? "var(--accent)" : "var(--gold)",
                  }} />

                  {/* Time */}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", width: 70 }}>
                    {formatTime(run.created_at)}
                  </span>

                  {/* Agent + slot */}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", width: 80 }}>
                    {run.agent}
                  </span>

                  {/* Content type */}
                  {run.content_type && (
                    <span className={`xp-queue-status ${run.status === "success" ? "posted" : "failed"}`}>
                      {run.content_type}
                    </span>
                  )}

                  {/* Slot */}
                  {run.slot && (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Slot {run.slot}</span>
                  )}

                  {/* Duration */}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>
                    {formatDuration(run.duration_ms)}
                  </span>

                  {/* Time ago */}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", width: 60, textAlign: "right" }}>
                    {timeAgo(run.created_at)}
                  </span>
                </div>

                {/* Expanded details */}
                {expandedId === run.id && (
                  <div style={{ marginTop: 8, marginLeft: 18 }}>
                    {run.tweet_text && (
                      <div style={{ padding: "8px 12px", background: "var(--paper)", borderRadius: 8, fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
                        {run.tweet_text}
                      </div>
                    )}
                    {run.tweet_url && (
                      <a href={run.tweet_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--accent)" }}>
                        View on X
                      </a>
                    )}
                    {run.error && (
                      <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }}>
                        Error: {run.error}
                      </div>
                    )}
                    {run.details && (
                      <pre style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontFamily: "var(--mono)", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(run.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
