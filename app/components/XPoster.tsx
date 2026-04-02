"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_CONTENT_TYPES, getAutomatedTypes } from "@/lib/content-types";
import PromptEditor from "./PromptEditor";
import PostSchedule from "./PostSchedule";
import StatusDashboard from "./StatusDashboard";
import TweetQueue from "./TweetQueue";
import ContentTypeSchema from "./ContentTypeSchema";

interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
  urlStrategy: string;
  bestTimeSlots: string[];
  automated: boolean;
}

interface PostSlot {
  slot: number;
  time: string;
  content_type: string;
}

interface Settings {
  posting_enabled: boolean;
  grok_prompt: string | null;
  active_posting_windows: {
    posts_per_day: number;
    schedule: PostSlot[];
  };
  generation_model: string;
  generation_lead_minutes: number;
  content_types: ContentType[] | null;
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

export default function XPosterPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, queueRes] = await Promise.all([
        fetch("/api/x-poster/settings"),
        fetch("/api/x-poster/queue"),
      ]);
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (queueRes.ok) setQueue((await queueRes.json()).queue || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const saveSettings = async (updates: Partial<Settings>) => {
    const res = await fetch("/api/x-poster/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
  };

  const queueAction = async (id: string, action: "skip" | "regenerate") => {
    await fetch("/api/x-poster/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    fetchData();
  };

  if (loading) return (
    <>
      <div className="header">
        <h1>Auto-Poster</h1>
        <div className="brand">PixieWire</div>
      </div>
      <div className="xp-container">
        <div className="xp-section" style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</div>
      </div>
    </>
  );

  const contentTypes = settings?.content_types && settings.content_types.length > 0
    ? settings.content_types
    : DEFAULT_CONTENT_TYPES;
  const schedulableTypes = getAutomatedTypes(contentTypes);

  return (
    <>
      <div className="header">
        <h1>Auto-Poster</h1>
        <div className="brand">PixieWire</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
          <a href="/log" className="xp-nav-link">Log</a>
          <a href="/analytics" className="xp-nav-link">Analytics</a>
        </div>
      </div>

      {error && (
        <div className="xp-container">
          <div className="xp-section" style={{ color: "var(--accent)" }}>{error}</div>
        </div>
      )}

      <div className="xp-container">
        {settings && (
          <>
            <StatusDashboard
              settings={settings}
              queue={queue}
              onToggle={(enabled) => saveSettings({ posting_enabled: enabled })}
            />
            <ContentTypeSchema
              contentTypes={contentTypes}
              defaults={DEFAULT_CONTENT_TYPES}
              onSave={(types) => saveSettings({ content_types: types })}
            />
            <PromptEditor
              prompt={settings.grok_prompt || ""}
              onSave={(prompt) => saveSettings({ grok_prompt: prompt })}
            />
            <PostSchedule
              schedule={settings.active_posting_windows}
              contentTypes={schedulableTypes}
              onSave={(schedule) => saveSettings({ active_posting_windows: schedule })}
            />
            <TweetQueue queue={queue} onAction={queueAction} />
          </>
        )}
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
