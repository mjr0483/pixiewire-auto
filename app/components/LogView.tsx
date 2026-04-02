"use client";

import { useState, useEffect } from "react";

interface Tweet {
  id: string;
  topic: string;
  type: string;
  text: string;
  cta_url: string | null;
  source_url: string | null;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  batch: string | null;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LogView() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/x-poster/log?limit=${limit}&offset=${page * limit}`)
      .then((r) => r.json())
      .then((data) => {
        setTweets(data.tweets || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [page]);

  return (
    <>
      <div className="header">
        <h1>Tweet Log</h1>
        <div className="brand">PixieWire</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
          <a href="/" className="xp-nav-link">Auto-Poster</a>
          <a href="/analytics" className="xp-nav-link">Analytics</a>
        </div>
      </div>

      <div className="xp-container">
        <div className="xp-section">
          <h2>{total} Total Tweets</h2>

          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading...</div>
          ) : tweets.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No tweets logged yet.</div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Time</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Type</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Content</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {tweets.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--rule-light)" }}>
                      <td style={{ padding: "8px 4px", whiteSpace: "nowrap", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                        {t.posted_at ? formatDate(t.posted_at) : t.scheduled_at ? formatDate(t.scheduled_at) : formatDate(t.created_at)}
                      </td>
                      <td style={{ padding: "8px 4px", whiteSpace: "nowrap", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                        {t.posted_at ? formatTime(t.posted_at) : t.scheduled_at ? formatTime(t.scheduled_at) : "—"}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.type}</span>
                      </td>
                      <td style={{ padding: "8px 4px", maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.text || "—"}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <span className={`xp-queue-status ${t.status}`}>{t.status}</span>
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        {t.source_url ? (
                          <a href={t.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 11 }}>source</a>
                        ) : t.cta_url ? (
                          <a href={t.cta_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 11 }}>link</a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <button
                  className="xp-btn xp-btn-secondary"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >Prev</button>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
                </span>
                <button
                  className="xp-btn xp-btn-secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * limit >= total}
                >Next</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
