"use client";

import { useState, useEffect, useMemo } from "react";
import NavPills from "./NavPills";

interface TweetWithMetrics {
  id: string;
  type: string;
  text: string;
  tweet_id: string | null;
  status: string;
  posted_at: string | null;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  bookmarks: number;
  metrics_updated_at: string | null;
}

type SortField = "impressions" | "likes" | "retweets" | "replies" | "bookmarks" | "posted_at";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York", month: "short", day: "numeric",
  });
}

export default function AnalyticsView() {
  const [tweets, setTweets] = useState<TweetWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("posted_at");
  const [showAll, setShowAll] = useState(false);

  const fetchData = () => {
    fetch("/api/x-poster/log?limit=500")
      .then((r) => r.json())
      .then((data) => {
        const posted = (data.tweets || []).filter((t: any) => t.status === "posted");
        setTweets(posted);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const syncMetrics = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await fetch("/api/x-poster/audit", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSyncResult(`${data.updated} updated, ${data.deleted} deleted`);
      fetchData();
    } else {
      setSyncResult(data.error || "Sync failed");
    }
    setSyncing(false);
  };

  const sorted = useMemo(() => {
    return [...tweets].sort((a, b) => {
      if (sortBy === "posted_at") {
        return new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime();
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });
  }, [tweets, sortBy]);

  const displayed = showAll ? sorted : sorted.slice(0, 20);

  // Totals
  const totals = tweets.reduce(
    (acc, t) => ({
      impressions: acc.impressions + (t.impressions || 0),
      likes: acc.likes + (t.likes || 0),
      retweets: acc.retweets + (t.retweets || 0),
      replies: acc.replies + (t.replies || 0),
      bookmarks: acc.bookmarks + (t.bookmarks || 0),
    }),
    { impressions: 0, likes: 0, retweets: 0, replies: 0, bookmarks: 0 },
  );

  // Type breakdown
  const typeBreakdown: Record<string, number> = {};
  tweets.forEach((t) => { typeBreakdown[t.type] = (typeBreakdown[t.type] || 0) + 1; });

  // Daily breakdown
  const byDay: Record<string, TweetWithMetrics[]> = {};
  tweets.forEach((t) => {
    if (!t.posted_at) return;
    const key = new Date(t.posted_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(t);
  });
  const days = Object.entries(byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, items]) => ({
      date,
      posted: items.length,
      impressions: items.reduce((s, t) => s + (t.impressions || 0), 0),
      likes: items.reduce((s, t) => s + (t.likes || 0), 0),
    }));

  const lastSync = tweets.find((t) => t.metrics_updated_at)?.metrics_updated_at;

  return (
    <>
      <div className="header">
        <h1>Analytics</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* Totals */}
        <div className="xp-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Overview ({tweets.length} tweets)</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {lastSync && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                  Last sync: {new Date(lastSync).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })}
                </span>
              )}
              <button className="xp-btn xp-btn-secondary" onClick={syncMetrics} disabled={syncing} style={{ padding: "5px 12px", fontSize: 10 }}>
                {syncing ? "Syncing..." : "Sync Metrics"}
              </button>
              {syncResult && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{syncResult}</span>}
            </div>
          </div>

          {loading ? (
            <div style={{ color: "var(--muted)", padding: 20, textAlign: "center" }}>Loading...</div>
          ) : (
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
          )}
        </div>

        {/* Per-tweet table with sorting */}
        {!loading && (
          <div className="xp-section">
            <h2>Tweet Performance</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", alignSelf: "center" }}>Sort by:</span>
              {(["posted_at", "impressions", "likes", "retweets", "replies", "bookmarks"] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => setSortBy(field)}
                  className={sortBy === field ? "xp-pill xp-pill-active" : "xp-pill"}
                  style={{ fontSize: 11, padding: "4px 12px" }}
                >
                  {field === "posted_at" ? "Recent" : field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                  <th style={{ padding: "6px 4px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "6px 4px", textAlign: "left" }}>Tweet</th>
                  <th style={{ padding: "6px 4px", textAlign: "right", cursor: "pointer" }} onClick={() => setSortBy("impressions")}>Impr</th>
                  <th style={{ padding: "6px 4px", textAlign: "right", cursor: "pointer" }} onClick={() => setSortBy("likes")}>Likes</th>
                  <th style={{ padding: "6px 4px", textAlign: "right", cursor: "pointer" }} onClick={() => setSortBy("retweets")}>RT</th>
                  <th style={{ padding: "6px 4px", textAlign: "right", cursor: "pointer" }} onClick={() => setSortBy("replies")}>Reply</th>
                  <th style={{ padding: "6px 4px", textAlign: "right", cursor: "pointer" }} onClick={() => setSortBy("bookmarks")}>Bkmk</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--rule-light)" }}>
                    <td style={{ padding: "6px 4px", whiteSpace: "nowrap", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                      {t.posted_at ? formatDate(t.posted_at) : "—"}
                    </td>
                    <td style={{ padding: "6px 4px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.tweet_id ? (
                        <a href={`https://x.com/PixieWireNews/status/${t.tweet_id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "none" }}>
                          {t.text.slice(0, 80)}{t.text.length > 80 ? "..." : ""}
                        </a>
                      ) : t.text.slice(0, 80)}
                    </td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{(t.impressions || 0).toLocaleString()}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.likes || 0}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.retweets || 0}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.replies || 0}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{t.bookmarks || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!showAll && sorted.length > 20 && (
              <button className="xp-btn xp-btn-secondary" onClick={() => setShowAll(true)} style={{ marginTop: 10 }}>
                Show All ({sorted.length} tweets)
              </button>
            )}
            {showAll && sorted.length > 20 && (
              <button className="xp-btn xp-btn-secondary" onClick={() => setShowAll(false)} style={{ marginTop: 10 }}>
                Show Top 20
              </button>
            )}
          </div>
        )}

        {/* Type breakdown */}
        {!loading && Object.keys(typeBreakdown).length > 0 && (
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
        {!loading && days.length > 0 && (
          <div className="xp-section">
            <h2>Daily Activity (Last 14 Days)</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                  <th style={{ padding: "8px 4px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "8px 4px", textAlign: "center" }}>Posted</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Impressions</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Likes</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.date} style={{ borderBottom: "1px solid var(--rule-light)" }}>
                    <td style={{ padding: "8px 4px", fontFamily: "var(--mono)", fontSize: 11 }}>{formatDate(d.date + "T12:00:00")}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: "var(--success)", fontWeight: 600 }}>{d.posted}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{d.impressions.toLocaleString()}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11 }}>{d.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
