"use client";

import { useState, useEffect, useMemo } from "react";
import NavPills from "./NavPills";

interface Tweet {
  id: string;
  topic: string;
  type: string;
  text: string;
  cta_url: string | null;
  source_url: string | null;
  tweet_id: string | null;
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
    timeZone: "America/New_York", month: "short", day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function toETDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export default function LogView() {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [page, setPage] = useState(0);
  const perPage = 25;
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchTweets = () => {
    fetch("/api/x-poster/log?limit=500")
      .then((r) => r.json())
      .then((data) => { setAllTweets(data.tweets || []); setLoading(false); });
  };

  const syncWithX = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await fetch("/api/x-poster/audit", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSyncResult(`Checked ${data.checked}, ${data.deleted} deleted`);
      fetchTweets();
    } else {
      setSyncResult(data.error || "Sync failed");
    }
    setSyncing(false);
  };

  useEffect(() => { fetchTweets(); }, []);

  const types = useMemo(() => [...new Set(allTweets.map((t) => t.type))].sort(), [allTweets]);
  const statuses = useMemo(() => [...new Set(allTweets.map((t) => t.status))].sort(), [allTweets]);

  const filtered = useMemo(() => {
    return allTweets.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterSearch && !t.text?.toLowerCase().includes(filterSearch.toLowerCase()) && !t.topic?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      if (filterDateFrom) {
        const tDate = toETDate(t.posted_at || t.scheduled_at || t.created_at);
        if (tDate < filterDateFrom) return false;
      }
      if (filterDateTo) {
        const tDate = toETDate(t.posted_at || t.scheduled_at || t.created_at);
        if (tDate > filterDateTo) return false;
      }
      return true;
    });
  }, [allTweets, filterType, filterStatus, filterSearch, filterDateFrom, filterDateTo]);

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  useEffect(() => { setPage(0); }, [filterType, filterStatus, filterSearch, filterDateFrom, filterDateTo]);

  return (
    <>
      <div className="header">
        <h1>Tweet Log</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        <div className="xp-section">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select className="xp-select" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="xp-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              className="xp-schema-input"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{ width: 140, padding: "5px 8px", fontSize: 12 }}
              title="From date"
            />
            <input
              type="date"
              className="xp-schema-input"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{ width: 140, padding: "5px 8px", fontSize: 12 }}
              title="To date"
            />
            <input
              type="text"
              className="xp-schema-input"
              placeholder="Search content..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ flex: 1, minWidth: 120, padding: "6px 10px", fontSize: 13 }}
            />
            {(filterType !== "all" || filterStatus !== "all" || filterSearch || filterDateFrom || filterDateTo) && (
              <button
                className="xp-btn xp-btn-secondary"
                onClick={() => { setFilterType("all"); setFilterStatus("all"); setFilterSearch(""); setFilterDateFrom(""); setFilterDateTo(""); }}
                style={{ padding: "5px 10px", fontSize: 10 }}
              >Clear</button>
            )}
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              className="xp-btn xp-btn-secondary"
              onClick={syncWithX}
              disabled={syncing}
              style={{ padding: "5px 10px", fontSize: 10, marginLeft: "auto" }}
            >
              {syncing ? "Syncing..." : "Sync with X"}
            </button>
            {syncResult && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{syncResult}</span>
            )}
          </div>
        </div>

        <div className="xp-section">
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading...</div>
          ) : paginated.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No tweets match your filters.</div>
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
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Links</th>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
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
                      <td style={{ padding: "8px 4px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.text || "—"}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <span className={`xp-queue-status ${t.status}`}>{t.status}</span>
                      </td>
                      <td style={{ padding: "8px 4px", whiteSpace: "nowrap" }}>
                        {t.tweet_id && (
                          <a href={`https://x.com/PixieWireNews/status/${t.tweet_id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 11, marginRight: 8 }}>tweet</a>
                        )}
                        {t.source_url && (
                          <a href={t.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", fontSize: 11 }}>source</a>
                        )}
                        {!t.tweet_id && !t.source_url && "—"}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        {t.status === "posted" && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await fetch("/api/x-poster/queue", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: t.id, action: "delete" }),
                              });
                              // Refresh
                              fetch("/api/x-poster/log?limit=500").then(r => r.json()).then(data => { setAllTweets(data.tweets || []); });
                            }}
                            style={{ fontSize: 10, color: "var(--muted)", background: "none", border: "1px solid var(--rule-light)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}
                          >
                            Mark Deleted
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <button className="xp-btn xp-btn-secondary" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Prev</button>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button className="xp-btn xp-btn-secondary" onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
