"use client";

import { useState } from "react";
import { DEFAULT_MASTER_PROMPT } from "@/lib/default-prompt";

interface Props {
  prompt: string;
  onSave: (prompt: string) => void;
}

export default function PromptEditor({ prompt, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(prompt || DEFAULT_MASTER_PROMPT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== prompt;

  const handleSave = async () => {
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetDefault = () => {
    setValue(DEFAULT_MASTER_PROMPT);
  };

  return (
    <div className="xp-section">
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <h2 style={{ margin: 0 }}>
          Master Prompt
          {dirty && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--gold)", marginLeft: 8 }}>unsaved</span>}
        </h2>
        <span style={{
          fontSize: 18, color: "var(--ink)", transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block",
        }}>&#9658;</span>
      </div>

      {open && (
        <>
          <textarea
            className="xp-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter the master prompt template..."
            style={{ minHeight: 200, marginTop: 12 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <button
              className="xp-btn xp-btn-primary"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save Prompt"}
            </button>
            <button className="xp-btn xp-btn-secondary" onClick={resetDefault}>
              Reset to Default
            </button>
          </div>
        </>
      )}
    </div>
  );
}
