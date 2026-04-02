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

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove tracking params
    u.searchParams.delete("adt_ei");
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    return u.toString();
  } catch {
    return url;
  }
}

export function formatHeadlinesForPrompt(headlines: Headline[]): string {
  if (headlines.length === 0) return "No recent headlines available.";

  return headlines
    .map((h, i) => `${i + 1}. "${h.title}" — ${h.source} (${cleanUrl(h.url)})`)
    .join("\n");
}
