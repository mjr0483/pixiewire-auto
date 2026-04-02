"use client";

interface Props {
  useGrok: boolean;
  claudePolish: boolean;
  onToggleGrok: (val: boolean) => void;
  onTogglePolish: (val: boolean) => void;
}

export default function AIPipeline({ useGrok, claudePolish, onToggleGrok, onTogglePolish }: Props) {
  return (
    <div className="xp-section">
      <h2>AI Pipeline</h2>

      {/* Visual flow */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", flexWrap: "wrap" }}>
        <div style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: "var(--paper)", border: "2px solid var(--rule)",
        }}>
          Headlines DB
        </div>
        <span style={{ color: "var(--rule)", fontSize: 18 }}>&rarr;</span>
        <div style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: useGrok ? "var(--ink)" : "var(--rule-light)",
          color: useGrok ? "var(--paper)" : "var(--muted)",
          border: useGrok ? "2px solid var(--ink)" : "2px solid var(--rule-light)",
        }}>
          Grok (research + draft)
        </div>
        <span style={{ color: "var(--rule)", fontSize: 18 }}>&rarr;</span>
        <div style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: claudePolish ? "var(--ink)" : "var(--rule-light)",
          color: claudePolish ? "var(--paper)" : "var(--muted)",
          border: claudePolish ? "2px solid var(--ink)" : "2px solid var(--rule-light)",
        }}>
          Claude (polish)
        </div>
        <span style={{ color: "var(--rule)", fontSize: 18 }}>&rarr;</span>
        <div style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: "var(--paper)", border: "2px solid var(--rule)",
        }}>
          Post to X
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="xp-toggle">
            <input type="checkbox" checked={useGrok} onChange={(e) => onToggleGrok(e.target.checked)} />
            <div className="xp-toggle-track" />
            <div className="xp-toggle-thumb" />
          </label>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Grok (xAI)</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Live X + web search, writes first draft (~$0.65/tweet)</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="xp-toggle">
            <input type="checkbox" checked={claudePolish} onChange={(e) => onTogglePolish(e.target.checked)} />
            <div className="xp-toggle-track" />
            <div className="xp-toggle-thumb" />
          </label>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Claude Polish</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Refines Grok's draft for voice + flow (~$0.001/tweet)</div>
          </div>
        </div>
      </div>

      {/* Current mode summary */}
      <div style={{ marginTop: 12, padding: "8px 10px", background: "var(--paper)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
        {useGrok && claudePolish && "Mode: Grok researches + drafts → Claude polishes → Post"}
        {useGrok && !claudePolish && "Mode: Grok researches + drafts → Post (no polish)"}
        {!useGrok && "Mode: Claude only (headlines from DB, no live search)"}
      </div>
    </div>
  );
}
