"use client";

import { useState } from "react";

interface ContentType {
  id: string;
  label: string;
  maxChars: number;
}

interface Props {
  contentTypes: ContentType[];
  onPublished: () => void;
}

export default function OnDemand({ contentTypes, onPublished }: Props) {
  const [selectedType, setSelectedType] = useState(contentTypes[0]?.id || "news");
  const [generatedText, setGeneratedText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; tweet_url?: string; error?: string } | null>(null);
  const [charCount, setCharCount] = useState(0);

  const ct = contentTypes.find((t) => t.id === selectedType);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/x-poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", content_type: selectedType }),
      });
      const data = await res.json();
      if (data.ok) {
        const tweetText = data.text.replace(/^["']|["']$/g, "").trim();
        setGeneratedText(tweetText);
        setCharCount(tweetText.length);
      } else {
        setResult({ ok: false, error: data.error });
      }
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    }
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!generatedText.trim()) return;
    setPublishing(true);
    setResult(null);
    try {
      const res = await fetch("/api/x-poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", content_type: selectedType, text: generatedText }),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) {
        onPublished();
      }
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    }
    setPublishing(false);
  };

  const handleTextChange = (text: string) => {
    setGeneratedText(text);
    setCharCount(text.length);
    setResult(null);
  };

  return (
    <div className="xp-section">
      <h2>On-Demand Tweet</h2>

      {/* Type selector */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <select
          className="xp-select"
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setResult(null); }}
          style={{ width: 180 }}
        >
          {contentTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>{ct.label}</option>
          ))}
        </select>
        <button
          className="xp-btn xp-btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Preview / Edit area */}
      {(generatedText || generating) && (
        <>
          <textarea
            className="xp-textarea"
            value={generatedText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={generating ? "Claude is writing..." : "Generated tweet will appear here. You can edit before publishing."}
            style={{ minHeight: 100 }}
            disabled={generating}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                className="xp-btn xp-btn-primary"
                onClick={handlePublish}
                disabled={publishing || !generatedText.trim() || !!result?.tweet_url}
                style={{ background: result?.tweet_url ? "var(--success)" : undefined }}
              >
                {publishing ? "Publishing..." : result?.tweet_url ? "Published" : "Publish to X"}
              </button>
              <button
                className="xp-btn xp-btn-secondary"
                onClick={handleGenerate}
                disabled={generating}
              >
                Regenerate
              </button>
            </div>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: ct && charCount > ct.maxChars ? "var(--accent)" : "var(--muted)",
            }}>
              {charCount}{ct ? ` / ${ct.maxChars}` : ""}
            </span>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11 }}>
          {result.ok && result.tweet_url ? (
            <a href={result.tweet_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--success)" }}>
              Posted — view on X
            </a>
          ) : result.error ? (
            <span style={{ color: "var(--accent)" }}>Error: {result.error}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
