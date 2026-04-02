import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { signOAuthRequest, getXCredentials } from "@/lib/x-api";
import { supabase } from "@/lib/supabase-client";

const SEARCH_QUERY = '(Disney OR "Walt Disney World" OR Disneyland OR "Magic Kingdom" OR EPCOT OR "Universal Orlando" OR "Epic Universe") -is:retweet -is:reply lang:en';

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const credentials = getXCredentials();
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(SEARCH_QUERY)}&max_results=10&start_time=${fifteenMinAgo}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name,public_metrics`;

    const headers = signOAuthRequest("GET", searchUrl, credentials);
    const response = await fetch(searchUrl, { headers });

    if (!response.ok) {
      const body = await response.text();
      // Free tier doesn't have search — log gracefully
      if (response.status === 403) {
        return NextResponse.json({
          ok: false,
          error: "X API search requires Basic tier ($100/mo). Current plan does not support search.",
          suggestion: "Upgrade at developer.x.com or use n8n RSS monitoring as an alternative.",
        });
      }
      return NextResponse.json({ ok: false, error: `X API ${response.status}: ${body}` });
    }

    const data = await response.json();
    const tweets = data.data || [];
    const users = data.includes?.users || [];

    // Filter for tweets with significant engagement (potential breaking news)
    const significant = tweets.filter((t: any) => {
      const metrics = t.public_metrics || {};
      return (metrics.like_count || 0) >= 50 || (metrics.retweet_count || 0) >= 20;
    });

    if (significant.length === 0) {
      return NextResponse.json({ ok: true, found: 0, message: "No breaking news detected" });
    }

    // Store findings in the monitor log
    const findings = significant.map((t: any) => {
      const author = users.find((u: any) => u.id === t.author_id);
      return {
        tweet_id: t.id,
        text: t.text,
        author: author?.username || "unknown",
        author_name: author?.name || "Unknown",
        author_followers: author?.public_metrics?.followers_count || 0,
        likes: t.public_metrics?.like_count || 0,
        retweets: t.public_metrics?.retweet_count || 0,
        created_at: t.created_at,
      };
    });

    // Insert into tweet_queue as "monitor" status for review
    for (const finding of findings) {
      // Check if we already logged this tweet
      const { data: existing } = await supabase()
        .from("tweet_queue")
        .select("id")
        .eq("source_url", `https://x.com/${finding.author}/status/${finding.tweet_id}`)
        .eq("type", "breaking")
        .maybeSingle();

      if (!existing) {
        await supabase()
          .from("tweet_queue")
          .insert({
            topic: `Breaking: ${finding.text.slice(0, 60)}...`,
            type: "breaking",
            text: `[MONITOR] @${finding.author}: ${finding.text}`,
            source_url: `https://x.com/${finding.author}/status/${finding.tweet_id}`,
            status: "monitor",
            batch: "breaking",
          });
      }
    }

    return NextResponse.json({
      ok: true,
      found: findings.length,
      findings,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// GET returns recent monitor findings
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("tweet_queue")
      .select("*")
      .eq("type", "breaking")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return NextResponse.json({ findings: data || [] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
