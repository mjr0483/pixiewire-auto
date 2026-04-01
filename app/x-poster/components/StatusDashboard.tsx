"use client";

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

export default function StatusDashboard({ settings, queue, onToggle }: Props) {
  const posted = queue.filter((q) => q.status === "posted").length;
  const total = settings.active_posting_windows.posts_per_day;

  const now = new Date();
  const nextSlot = settings.active_posting_windows.schedule
    .filter((s) => {
      const [h, m] = s.time.split(":").map(Number);
      const slotDate = new Date(now.toLocaleDateString("en-US", { timeZone: "America/New_York" }));
      slotDate.setHours(h, m, 0, 0);
      return slotDate > now || !queue.some((q) => q.batch === String(s.slot) && q.status === "posted");
    })[0];

  const lastPosted = [...queue].filter((q) => q.status === "posted").sort((a, b) =>
    new Date(b.posted_at!).getTime() - new Date(a.posted_at!).getTime()
  )[0];

  const lastError = [...queue].filter((q) => q.status === "failed").sort((a, b) =>
    new Date(b.scheduled_at!).getTime() - new Date(a.scheduled_at!).getTime()
  )[0];

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
              ? `${formatTimeET(lastPosted.posted_at!)} — "${lastPosted.text.slice(0, 60)}..."`
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
    </div>
  );
}
