"use client";

import { useState, useEffect } from "react";

interface TweetStats {
  id: string;
  type: string;
  text: string;
  posted_at: string;
  status: string;
}

interface DaySummary {
  date: string;
  total: number;
  posted: number;
  failed: number;
  skipped: number;
  types: Record<string, number>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsView() {
  const [tweets, setTweets] = useState<TweetStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [xApiNote, setXApiNote] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/x-poster/log?limit=200")
      .then((r) => r.json())
      .then((data) => {
        setTweets(data.tweets || []);
        setLoading(false);
      });
  }, []);

  // Group by day
  const byDay: Record<string, TweetStats[]> = {};
  tweets.forEach((t) => {
    const date = t.posted_at
      ? new Date(t.posted_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" })
      : new Date(t.status === "posted" ? t.posted_at : "").toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const key = t.posted_at ? new Date(t.posted_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" }) : "unposted";
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(t);
  });

  const days: DaySummary[] = Object.entries(byDay)
    .filter(([key]) => key !== "unposted")
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, items]) => {
      const types: Record<string, number> = {};
      items.forEach((t) => { types[t.type] = (types[t.type] || 0) + 1; });
      return {
        date,
        total: items.length,
        posted: items.filter((t) => t.status === "posted").length,
        failed: items.filter((t) => t.status === "failed").length,
        skipped: items.filter((t) => t.status === "skipped").length,
        types,
      };
    });

  const totalPosted = tweets.filter((t) => t.status === "posted").length;
  const totalFailed = tweets.filter((t) => t.status === "failed").length;
  const typeBreakdown: Record<string, number> = {};
  tweets.filter((t) => t.status === "posted").forEach((t) => {
    typeBreakdown[t.type] = (typeBreakdown[t.type] || 0) + 1;
  });

  return (
    <>
      <div className="header">
        <h1>Analytics</h1>
        <div className="brand">PixieWire</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
          <a href="/" className="xp-nav-link">Auto-Poster</a>
          <a href="/log" className="xp-nav-link">Log</a>
        </div>
      </div>

      <div className="xp-container">
        {loading ? (
          <div className="xp-section" style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="xp-section">
              <h2>Overview</h2>
              <div className="xp-status-grid">
                <div className="xp-stat">
                  <div className="xp-stat-label">Total Posted</div>
                  <div className="xp-stat-value" style={{ color: "var(--success)" }}>{totalPosted}</div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Failed</div>
                  <div className="xp-stat-value" style={{ color: totalFailed > 0 ? "var(--accent)" : "var(--muted)" }}>{totalFailed}</div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Success Rate</div>
                  <div className="xp-stat-value">
                    {totalPosted + totalFailed > 0
                      ? `${Math.round((totalPosted / (totalPosted + totalFailed)) * 100)}%`
                      : "—"}
                  </div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Active Days</div>
                  <div className="xp-stat-value">{days.length}</div>
                </div>
              </div>
            </div>

            {/* Type breakdown */}
            <div className="xp-section">
              <h2>Posts by Type</h2>
              {Object.entries(typeBreakdown).length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>No posted tweets yet.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(typeBreakdown).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                    <div key={type} style={{
                      padding: "8px 14px", background: "var(--paper)", borderRadius: 8,
                      fontFamily: "var(--mono)", fontSize: 12,
                    }}>
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", fontSize: 10 }}>{type}</span>
                      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily breakdown */}
            <div className="xp-section">
              <h2>Daily Activity (Last 14 Days)</h2>
              {days.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>No activity yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px 4px", textAlign: "center" }}>Posted</th>
                      <th style={{ padding: "8px 4px", textAlign: "center" }}>Failed</th>
                      <th style={{ padding: "8px 4px", textAlign: "center" }}>Skipped</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>Types</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d) => (
                      <tr key={d.date} style={{ borderBottom: "1px solid var(--rule-light)" }}>
                        <td style={{ padding: "8px 4px", fontFamily: "var(--mono)", fontSize: 11 }}>{formatDate(d.date + "T12:00:00")}</td>
                        <td style={{ padding: "8px 4px", textAlign: "center", color: "var(--success)", fontWeight: 600 }}>{d.posted}</td>
                        <td style={{ padding: "8px 4px", textAlign: "center", color: d.failed > 0 ? "var(--accent)" : "var(--muted)" }}>{d.failed}</td>
                        <td style={{ padding: "8px 4px", textAlign: "center", color: "var(--muted)" }}>{d.skipped}</td>
                        <td style={{ padding: "8px 4px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                          {Object.entries(d.types).map(([t, c]) => `${t}:${c}`).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* X API engagement note */}
            <div className="xp-section">
              <h2>X Engagement Stats</h2>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                X API engagement metrics (likes, retweets, impressions) require the Basic tier API ($100/mo).
                The current free tier supports posting and user lookup only.
                To enable engagement tracking, upgrade at <a href="https://developer.x.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>developer.x.com</a>.
              </div>
            </div>
          </>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
