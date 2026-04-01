"use client";

import { useState } from "react";

interface PostSlot {
  slot: number;
  time: string;
  content_type: string;
}

interface Schedule {
  posts_per_day: number;
  schedule: PostSlot[];
}

interface Props {
  schedule: Schedule;
  contentTypes: { id: string; label: string }[];
  onSave: (schedule: Schedule) => void;
}

function adjustTime(time: string, delta: number): string {
  const [h, m] = time.split(":").map(Number);
  let totalMinutes = h * 60 + m + delta;
  if (totalMinutes < 0) totalMinutes = 0;
  if (totalMinutes > 23 * 60 + 30) totalMinutes = 23 * 60 + 30;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function PostSchedule({ schedule, contentTypes, onSave }: Props) {
  const [slots, setSlots] = useState<PostSlot[]>(schedule?.schedule || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSlot = (index: number, field: keyof PostSlot, value: string | number) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const addSlot = () => {
    const lastTime = slots.length > 0 ? slots[slots.length - 1].time : "08:00";
    const newTime = adjustTime(lastTime, 120);
    setSlots([...slots, { slot: slots.length + 1, time: newTime, content_type: contentTypes[0]?.id || "news" }]);
  };

  const removeSlot = (index: number) => {
    const updated = slots.filter((_, i) => i !== index).map((s, i) => ({ ...s, slot: i + 1 }));
    setSlots(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ posts_per_day: slots.length, schedule: slots });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="xp-section">
      <h2>Posting Schedule ({slots.length} posts/day) &mdash; All times ET</h2>

      {slots.map((slot, i) => (
        <div key={i} className="xp-row">
          <span className="xp-slot-num">{slot.slot}.</span>
          <button className="xp-time-btn" onClick={() => updateSlot(i, "time", adjustTime(slot.time, -30))} title="Earlier">&uarr;</button>
          <input
            type="text"
            className="xp-time-input"
            value={slot.time}
            onChange={(e) => updateSlot(i, "time", e.target.value)}
          />
          <button className="xp-time-btn" onClick={() => updateSlot(i, "time", adjustTime(slot.time, 30))} title="Later">&darr;</button>
          <select
            className="xp-select"
            value={slot.content_type}
            onChange={(e) => updateSlot(i, "content_type", e.target.value)}
          >
            {contentTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.label}</option>
            ))}
          </select>
          <button
            className="xp-time-btn"
            onClick={() => removeSlot(i)}
            title="Remove"
            style={{ color: "var(--accent)" }}
          >&times;</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="xp-btn xp-btn-secondary" onClick={addSlot}>+ Add Post</button>
        <button className="xp-btn xp-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved" : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}
