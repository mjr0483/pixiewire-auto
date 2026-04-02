"use client";

import { useState, useEffect } from "react";
import NavPills from "./NavPills";

interface BreakingItem {
  id: string;
  topic: string;
  text: string;
  source_url: string | null;
  status: string;
  tweet_id: string | null;
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
  const [findings, setFindings] = useState<BreakingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitorActive, setMonitorActive] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchFindings = () => {
    fetch("/api/x-poster/breaking")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setFindings(data.findings || []); setLoading(false); });
  };

  const fetchToggleState = () => {
    fetch("/api/x-poster/monitor-toggle")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setMonitorActive(data.active); });
  };

  useEffect(() => { fetchFindings(); fetchToggleState(); }, []);
  useEffect(() => {
    const interval = setInterval(fetchFindings, 30000);
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

  const publishTweet = async (item: BreakingItem) => {
    const text = editingId === item.id ? editText : item.text;
    setPublishing(item.id);
    const res = await fetch("/api/x-poster/breaking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, text }),
    });
    const data = await res.json();
    if (data.ok) {
      setEditingId(null);
      fetchFindings();
    }
    setPublishing(null);
  };

  const dismissItem = async (id: string) => {
    await fetch("/api/x-poster/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "skip" }),
    });
    fetchFindings();
  };

  const monitorItems = findings.filter((f) => f.status === "monitor");
  const postedItems = findings.filter((f) => f.status === "posted");
  const dismissedItems = findings.filter((f) => f.status === "skipped");

  return (
    <>
      <div className="header">
        <h1>Breaking News</h1>
        <div className="brand">PixieWire</div>
        <NavPills />
      </div>

      <div className="xp-container">
        {/* Monitor ON/OFF banner */}
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
                {monitorActive ? "Scanning for breaking Disney news every 15 min (7am-8pm)" : "Breaking news scanning is disabled"}
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

        {/* Pending review - draft tweets ready to post */}
        <div className="xp-section">
          <h2>Pending Review ({monitorItems.length})</h2>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading...</div>
          ) : monitorItems.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
              No breaking news items pending. The monitor agent checks for new headlines every 15 minutes and drafts tweets for your review.
            </div>
          ) : (
            monitorItems.map((item) => (
              <div key={item.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule-light)" }}>
                {/* Headline */}
                <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: 6 }}>
                  {timeAgo(item.created_at)} - {item.topic}
                </div>

                {/* Draft tweet - editable */}
                {editingId === item.id ? (
                  <textarea
                    className="xp-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ minHeight: 80, marginBottom: 8 }}
                  />
                ) : (
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 8, padding: "10px 12px", background: "var(--paper)", borderRadius: 8 }}>
                    {item.text}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    className="xp-btn xp-btn-primary"
                    onClick={() => publishTweet(item)}
                    disabled={publishing === item.id}
                    style={{ padding: "8px 20px" }}
                  >
                    {publishing === item.id ? "Posting..." : "Post to X"}
                  </button>
                  {editingId === item.id ? (
                    <button className="xp-btn xp-btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                  ) : (
                    <button className="xp-btn xp-btn-secondary" onClick={() => { setEditingId(item.id); setEditText(item.text); }}>Edit</button>
                  )}
                  <button className="xp-btn xp-btn-danger" onClick={() => dismissItem(item.id)} style={{ padding: "8px 16px" }}>Dismiss</button>
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--accent)", marginLeft: "auto" }}>source</a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recently posted breaking tweets */}
        {postedItems.length > 0 && (
          <div className="xp-section">
            <h2>Posted ({postedItems.length})</h2>
            {postedItems.slice(0, 10).map((item) => (
              <div key={item.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--rule-light)", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>{timeAgo(item.created_at)}</span>
                  {item.tweet_id && (
                    <a href={`https://x.com/PixieWireNews/status/${item.tweet_id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 11 }}>view on X</a>
                  )}
                </div>
                <div style={{ marginTop: 4 }}>{item.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dismissed */}
        {dismissedItems.length > 0 && (
          <div className="xp-section">
            <h2>Dismissed ({dismissedItems.length})</h2>
            {dismissedItems.slice(0, 10).map((item) => (
              <div key={item.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-light)", fontSize: 12, color: "var(--muted)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{timeAgo(item.created_at)}</span>
                {" - "}{item.topic}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
