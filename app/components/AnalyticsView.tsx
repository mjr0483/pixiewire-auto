"use client";

import { useState, useEffect } from "react";
import NavPills from "./NavPills";

interface TweetMetric {
  id: string;
  text: string;
  created_at: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
}

interface LogTweet {
  id: string;
  type: string;
  text: string;
  posted_at: string;
  status: string;
}

interface DaySummary {
  date: string;
  posted: number;
  failed: number;
  skipped: number;
  types: Record<string, number>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric",
  });
}

export default function AnalyticsView() {
  const [logTweets, setLogTweets] = useState<LogTweet[]>([]);
  const [metrics, setMetrics] = useState<TweetMetric[]>([]);
  const [totals, setTotals] = useState<{ impressions: number; likes: number; retweets: number; replies: number; bookmarks: number } | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/x-poster/log?limit=200")
      .then((r) => r.json())
      .then((data) => { setLogTweets(data.tweets || []); setLoading(false); });

    fetch("/api/x-poster/analytics")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setMetrics(data.tweets || []);
          setTotals(data.totals || null);
        } else {
          setMetricsError(data.error);
        }
        setMetricsLoading(false);
      })
      .catch((e) => { setMetricsError(e.message); setMetricsLoading(false); });
  }, []);

  // Group log tweets by day
  const byDay: Record<string, LogTweet[]> = {};
  logTweets.forEach((t) => {
    if (!t.posted_at) return;
    const key = new Date(t.posted_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(t);
  });

  const days: DaySummary[] = Object.entries(byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, items]) => {
      const types: Record<string, number> = {};
      items.forEach((t) => { types[t.type] = (types[t.type] || 0) + 1; });
      return {
        date,
        posted: items.filter((t) => t.status === "posted").length,
        failed: items.filter((t) => t.status === "failed").length,
        skipped: items.filter((t) => t.status === "skipped").length,
        types,
      };
    });

  const totalPosted = logTweets.filter((t) => t.status === "posted").length;
  const totalFailed = logTweets.filter((t) => t.status === "failed").length;
  const typeBreakdown: Record<string, number> = {};
  logTweets.filter((t) => t.status === "posted").forEach((t) => {
    typeBreakdown[t.type] = (typeBreakdown[t.type] || 0) + 1;
  });

  return (
    <>
      <div className="header">
        <h1>Analytics</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* X Engagement — real data from Postiz credentials */}
        <div className="xp-section">
          <h2>X Engagement (Last 20 Tweets)</h2>
          {metricsLoading ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: 10 }}>Loading metrics from X...</div>
          ) : metricsError ? (
            <div style={{ color: "var(--accent)", fontSize: 13, padding: 10 }}>{metricsError}</div>
          ) : totals ? (
            <>
              <div className="xp-status-grid">
                <div className="xp-stat">
                  <div className="xp-stat-label">Impressions</div>
                  <div className="xp-stat-value">{totals.impressions.toLocaleString()}</div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Likes</div>
                  <div className="xp-stat-value">{totals.likes.toLocaleString()}</div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Retweets</div>
                  <div className="xp-stat-value">{totals.retweets.toLocaleString()}</div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Replies</div>
                  <div className="xp-stat-value">{totals.replies.toLocaleString()}</div>
                </div>
              </div>

              {/* Per-tweet breakdown */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                    <th style={{ padding: "6px 4px", textAlign: "left" }}>Tweet</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Impr</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Likes</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>RT</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Reply</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--rule-light)" }}>
                      <td style={{ padding: "6px 4px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <a href={`https://x.com/PixieWireNews/status/${t.id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "none" }}>
                          {t.text.slice(0, 80)}{t.text.length > 80 ? "..." : ""}
                        </a>
                      </td>
                      <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.impressions.toLocaleString()}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.likes}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.retweets}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.replies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>No metrics data available.</div>
          )}
        </div>

        {loading ? (
          <div className="xp-section" style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : (
          <>
            {/* Posting overview */}
            <div className="xp-section">
              <h2>Posting Overview</h2>
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
                      : "\u2014"}
                  </div>
                </div>
                <div className="xp-stat">
                  <div className="xp-stat-label">Active Days</div>
                  <div className="xp-stat-value">{days.length}</div>
                </div>
              </div>
            </div>

            {/* Type breakdown */}
            {Object.entries(typeBreakdown).length > 0 && (
              <div className="xp-section">
                <h2>Posts by Type</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(typeBreakdown).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                    <div key={type} style={{ padding: "8px 14px", background: "var(--paper)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12 }}>
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", fontSize: 10 }}>{type}</span>
                      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily breakdown */}
            {days.length > 0 && (
              <div className="xp-section">
                <h2>Daily Activity (Last 14 Days)</h2>
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
              </div>
            )}
          </>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
