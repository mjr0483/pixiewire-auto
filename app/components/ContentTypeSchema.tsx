"use client";

import { useState } from "react";

interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
  urlStrategy: string;
  bestTimeSlots: string[];
}

interface Props {
  contentTypes: ContentType[];
  defaults: ContentType[];
  onSave: (types: ContentType[]) => void;
}

export default function ContentTypeSchema({ contentTypes, defaults, onSave }: Props) {
  const [types, setTypes] = useState<ContentType[]>(contentTypes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (index: number, field: keyof ContentType, value: string | number | string[]) => {
    const updated = [...types];
    updated[index] = { ...updated[index], [field]: value };
    setTypes(updated);
  };

  const addType = () => {
    setTypes([...types, { id: "", label: "", maxChars: 280, description: "", urlStrategy: "None", bestTimeSlots: [] }]);
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

  return (
    <div className="xp-section">
      <h2>Content Type Schema</h2>

      <div className="xp-schema-header-row">
        <span>ID</span>
        <span>Label</span>
        <span>Max</span>
        <span>Description</span>
        <span>URL Strategy</span>
        <span>Time Slots</span>
        <span></span>
      </div>

      {types.map((ct, i) => (
        <div key={i} className="xp-schema-row">
          <input
            className="xp-schema-input"
            value={ct.id}
            onChange={(e) => update(i, "id", e.target.value.toLowerCase().replace(/\s/g, "_"))}
            placeholder="id"
          />
          <input
            className="xp-schema-input"
            value={ct.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Label"
          />
          <input
            className="xp-schema-input"
            type="number"
            value={ct.maxChars}
            onChange={(e) => update(i, "maxChars", parseInt(e.target.value) || 0)}
            style={{ width: 50 }}
          />
          <input
            className="xp-schema-input"
            value={ct.description}
            onChange={(e) => update(i, "description", e.target.value)}
            placeholder="Description"
          />
          <input
            className="xp-schema-input"
            value={ct.urlStrategy}
            onChange={(e) => update(i, "urlStrategy", e.target.value)}
            placeholder="URL strategy"
          />
          <input
            className="xp-schema-input"
            value={ct.bestTimeSlots.join(", ")}
            onChange={(e) => update(i, "bestTimeSlots", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            placeholder="Morning, Midday"
          />
          <button
            className="xp-time-btn"
            onClick={() => removeType(i)}
            style={{ color: "var(--accent)" }}
            title="Remove"
          >&times;</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="xp-btn xp-btn-secondary" onClick={addType}>+ Add Type</button>
        <button className="xp-btn xp-btn-secondary" onClick={resetDefaults}>Reset Defaults</button>
        <button className="xp-btn xp-btn-primary" onClick={handleSave} disabled={saving || types.length === 0}>
          {saving ? "Saving..." : saved ? "Saved" : "Save Schema"}
        </button>
      </div>
    </div>
  );
}
