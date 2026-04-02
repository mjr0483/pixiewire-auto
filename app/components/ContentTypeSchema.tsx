"use client";

import { useState } from "react";

interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
  urlStrategy: string;
  bestTimeSlots: string[];
  automated: boolean;
}

interface Props {
  contentTypes: ContentType[];
  defaults: ContentType[];
  onSave: (types: ContentType[]) => void;
}

export default function ContentTypeSchema({ contentTypes, defaults, onSave }: Props) {
  const [types, setTypes] = useState<ContentType[]>(contentTypes);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (index: number, field: keyof ContentType, value: string | number | string[] | boolean) => {
    const updated = [...types];
    updated[index] = { ...updated[index], [field]: value };
    setTypes(updated);
  };

  const addType = () => {
    setTypes([...types, { id: "", label: "", maxChars: 280, description: "", urlStrategy: "None", bestTimeSlots: [], automated: true }]);
  };

  const removeType = (index: number) => {
    setTypes(types.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(types);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetDefaults = () => {
    setTypes([...defaults]);
  };

  const autoTypes = types.filter((t) => t.automated);
  const manualTypes = types.filter((t) => !t.automated);

  return (
    <div className="xp-section">
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <h2 style={{ margin: 0 }}>Content Type Schema ({types.length} types)</h2>
        <span style={{
          fontSize: 18, color: "var(--ink)", transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block",
        }}>&#9658;</span>
      </div>

      {open && (
        <>
          {autoTypes.length > 0 && (
            <>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--success)", marginTop: 14, marginBottom: 6 }}>
                Automated
              </div>
              <div className="xp-schema-header-row">
                <span>ID</span><span>Label</span><span>Max</span><span>Description</span><span>URL Strategy</span><span>Time Slots</span><span></span>
              </div>
              {types.map((ct, i) => ct.automated && (
                <div key={i} className="xp-schema-row">
                  <input className="xp-schema-input" value={ct.id} onChange={(e) => update(i, "id", e.target.value.toLowerCase().replace(/\s/g, "_"))} placeholder="id" />
                  <input className="xp-schema-input" value={ct.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Label" />
                  <input className="xp-schema-input" type="number" value={ct.maxChars} onChange={(e) => update(i, "maxChars", parseInt(e.target.value) || 0)} style={{ width: 50 }} />
                  <input className="xp-schema-input" value={ct.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
                  <input className="xp-schema-input" value={ct.urlStrategy} onChange={(e) => update(i, "urlStrategy", e.target.value)} placeholder="URL strategy" />
                  <input className="xp-schema-input" value={ct.bestTimeSlots.join(", ")} onChange={(e) => update(i, "bestTimeSlots", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Morning, Midday" />
                  <button className="xp-time-btn" onClick={() => removeType(i)} style={{ color: "var(--accent)" }} title="Remove">&times;</button>
                </div>
              ))}
            </>
          )}

          {manualTypes.length > 0 && (
            <>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginTop: 14, marginBottom: 6 }}>
                Manual Only (not scheduled)
              </div>
              <div className="xp-schema-header-row">
                <span>ID</span><span>Label</span><span>Max</span><span>Description</span><span>URL Strategy</span><span>Time Slots</span><span></span>
              </div>
              {types.map((ct, i) => !ct.automated && (
                <div key={i} className="xp-schema-row">
                  <input className="xp-schema-input" value={ct.id} onChange={(e) => update(i, "id", e.target.value.toLowerCase().replace(/\s/g, "_"))} placeholder="id" />
                  <input className="xp-schema-input" value={ct.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Label" />
                  <input className="xp-schema-input" type="number" value={ct.maxChars} onChange={(e) => update(i, "maxChars", parseInt(e.target.value) || 0)} style={{ width: 50 }} />
                  <input className="xp-schema-input" value={ct.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
                  <input className="xp-schema-input" value={ct.urlStrategy} onChange={(e) => update(i, "urlStrategy", e.target.value)} placeholder="URL strategy" />
                  <input className="xp-schema-input" value={ct.bestTimeSlots.join(", ")} onChange={(e) => update(i, "bestTimeSlots", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Any" />
                  <button className="xp-time-btn" onClick={() => removeType(i)} style={{ color: "var(--accent)" }} title="Remove">&times;</button>
                </div>
              ))}
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="xp-btn xp-btn-secondary" onClick={addType}>+ Add Type</button>
            <button className="xp-btn xp-btn-secondary" onClick={resetDefaults}>Reset Defaults</button>
            <button className="xp-btn xp-btn-primary" onClick={handleSave} disabled={saving || types.length === 0}>
              {saving ? "Saving..." : saved ? "Saved" : "Save Schema"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
