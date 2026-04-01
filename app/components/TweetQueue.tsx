"use client";

import { useState } from "react";

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
  queue: QueueItem[];
  onAction: (id: string, action: "skip" | "regenerate") => void;
}

function formatTimeET(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TweetQueue({ queue, onAction }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (queue.length === 0) {
    return (
      <div className="xp-section">
        <h2>Tweet Queue</h2>
        <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>
          No tweets scheduled for today yet. The tick endpoint will generate them as post times approach.
        </div>
      </div>
    );
  }

  return (
    <div className="xp-section">
      <h2>Tweet Queue &mdash; Today</h2>
      {queue.map((item) => (
        <div key={item.id} className="xp-queue-row" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
          <div className="xp-queue-header">
            <span className="xp-queue-time">
              {item.scheduled_at ? formatTimeET(item.scheduled_at) : "—"}
            </span>
            <span className="xp-queue-type">{item.type}</span>
            <span className={`xp-queue-status ${item.status}`}>{item.status}</span>
          </div>
          {expandedId === item.id && (
            <>
              <div className="xp-queue-detail">
                {item.text || "(no text generated yet)"}
              </div>
              {item.error_message && (
                <div className="xp-queue-detail" style={{ color: "var(--accent)", fontSize: 12 }}>
                  Error: {item.error_message}
                </div>
              )}
              {(item.status === "scheduled" || item.status === "failed") && (
                <div className="xp-queue-actions">
                  <button className="xp-btn xp-btn-secondary" onClick={(e) => { e.stopPropagation(); onAction(item.id, "regenerate"); }}>
                    Regenerate
                  </button>
                  <button className="xp-btn xp-btn-danger" onClick={(e) => { e.stopPropagation(); onAction(item.id, "skip"); }}>
                    Skip
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
