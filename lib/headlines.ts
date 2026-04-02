import { supabase } from "./supabase-client";

interface Headline {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export async function getRecentHeadlines(hours: number = 12, limit: number = 20): Promise<Headline[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase()
    .from("daily_headlines")
    .select("title, url, source, published_at")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as Headline[];
}

export function formatHeadlinesForPrompt(headlines: Headline[]): string {
  if (headlines.length === 0) return "No recent headlines available.";

  return headlines
    .map((h, i) => `${i + 1}. "${h.title}" — ${h.source} (${h.url})`)
    .join("\n");
}
