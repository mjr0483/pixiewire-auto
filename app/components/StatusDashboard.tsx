"use client";

import { useState } from "react";

interface PostSlot {
  slot: number;
  time: string;
  content_type: string;
}

interface Settings {
  posting_enabled: boolean;
  active_posting_windows: {
    posts_per_day: number;
    schedule: PostSlot[];
  };
  last_tick_at: string | null;
  last_tick_result: { actions: string[] } | null;
}

interface QueueItem {
  id: string;
  type: string;
  text: string;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
  error_message: string | null;
  batch: string | null;
}

interface Props {
  settings: Settings;
  queue: QueueItem[];
  onToggle: (enabled: boolean) => void;
}

function formatTimeET(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

export default function StatusDashboard({ settings, queue, onToggle }: Props) {
  const [testResult, setTestResult] = useState<{ ok: boolean; username?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [pushResult, setPushResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pushTesting, setPushTesting] = useState(false);

  const schedule = settings.active_posting_windows?.schedule || [];
  const posted = queue.filter((q) => q.status === "posted").length;
  const total = settings.active_posting_windows?.posts_per_day || 0;

  const nextSlot = schedule.filter((s) => {
    return !queue.some((q) => q.batch === String(s.slot) && (q.status === "posted" || q.status === "scheduled"));
  })[0];

  const lastPosted = [...queue].filter((q) => q.status === "posted").sort((a, b) =>
    new Date(b.posted_at!).getTime() - new Date(a.posted_at!).getTime()
  )[0];

  const lastError = [...queue].filter((q) => q.status === "failed").sort((a, b) =>
    new Date(b.scheduled_at!).getTime() - new Date(a.scheduled_at!).getTime()
  )[0];

  const testXConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/x-poster/test-x");
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ ok: false, error: (e as Error).message });
    }
    setTesting(false);
  };

  return (
    <div className="xp-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Status</h2>
        <label className="xp-toggle">
          <input
            type="checkbox"
            checked={settings.posting_enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="xp-toggle-track" />
          <div className="xp-toggle-thumb" />
        </label>
      </div>

      <div className="xp-status-grid">
        <div className="xp-stat">
          <div className="xp-stat-label">Today</div>
          <div className="xp-stat-value">{posted} / {total} posted</div>
        </div>
        <div className="xp-stat">
          <div className="xp-stat-label">Next Post</div>
          <div className="xp-stat-value">
            {nextSlot ? `${nextSlot.time} ET — ${nextSlot.content_type}` : "Done for today"}
          </div>
        </div>
        <div className="xp-stat">
          <div className="xp-stat-label">Last Posted</div>
          <div className="xp-stat-value" style={{ fontSize: 13 }}>
            {lastPosted
              ? `${formatTimeET(lastPosted.posted_at!)} — "${lastPosted.text.slice(0, 50)}..."`
              : "None today"}
          </div>
        </div>
        <div className="xp-stat">
          <div className="xp-stat-label">Last Error</div>
          <div className="xp-stat-value" style={{ fontSize: 13, color: lastError ? "var(--accent)" : "var(--muted)" }}>
            {lastError ? lastError.error_message?.slice(0, 80) : "None"}
          </div>
        </div>
      </div>

      {/* Last tick info */}
      <div style={{ marginTop: 12, padding: "8px 10px", background: "var(--paper)", borderRadius: 8, fontSize: 12 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
          Last Tick
        </span>
        {settings.last_tick_at ? (
          <div style={{ marginTop: 4, color: "var(--ink)" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{timeAgo(settings.last_tick_at)}</span>
            {settings.last_tick_result?.actions?.map((a, i) => (
              <div key={i} style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{a}</div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--muted)" }}>No ticks recorded yet</div>
        )}
      </div>

      {/* Connection tests */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="xp-btn xp-btn-secondary" onClick={testXConnection} disabled={testing}>
          {testing ? "Testing..." : "Test X"}
        </button>
        {testResult && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: testResult.ok ? "var(--success)" : "var(--accent)" }}>
            {testResult.ok ? `@${testResult.username}` : `Failed: ${testResult.error?.slice(0, 40)}`}
          </span>
        )}
        <button className="xp-btn xp-btn-secondary" onClick={async () => {
          setPushTesting(true); setPushResult(null);
          try {
            const res = await fetch("/api/x-poster/test-pushover");
            setPushResult(await res.json());
          } catch (e) { setPushResult({ ok: false, error: (e as Error).message }); }
          setPushTesting(false);
        }} disabled={pushTesting}>
          {pushTesting ? "Sending..." : "Test Pushover"}
        </button>
        {pushResult && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: pushResult.ok ? "var(--success)" : "var(--accent)" }}>
            {pushResult.ok ? "Sent" : `Failed: ${pushResult.error?.slice(0, 40)}`}
          </span>
        )}
      </div>
    </div>
  );
}
