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

export default function LogView() {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  const [page, setPage] = useState(0);
  const perPage = 25;

  useEffect(() => {
    fetch("/api/x-poster/log?limit=500")
      .then((r) => r.json())
      .then((data) => {
        setAllTweets(data.tweets || []);
        setLoading(false);
      });
  }, []);

  // Derive unique values for filter dropdowns
  const types = useMemo(() => [...new Set(allTweets.map((t) => t.type))].sort(), [allTweets]);
  const statuses = useMemo(() => [...new Set(allTweets.map((t) => t.status))].sort(), [allTweets]);

  // Apply filters
  const filtered = useMemo(() => {
    return allTweets.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterSearch && !t.text?.toLowerCase().includes(filterSearch.toLowerCase()) && !t.topic?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      return true;
    });
  }, [allTweets, filterType, filterStatus, filterSearch]);

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filterType, filterStatus, filterSearch]);

  return (
    <>
      <div className="header">
        <h1>Tweet Log</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* Filters */}
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
              type="text"
              className="xp-schema-input"
              placeholder="Search content..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ flex: 1, minWidth: 150, padding: "6px 10px", fontSize: 13 }}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
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
                        {t.cta_url && (
                          <a href={t.cta_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 11, marginRight: 8 }}>tweet</a>
                        )}
                        {t.source_url && (
                          <a href={t.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", fontSize: 11 }}>source</a>
                        )}
                        {!t.cta_url && !t.source_url && "—"}
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
