import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  try {
    // Fetch tweet_queue entries
    const { data: queueData, error: queueErr } = await supabase()
      .from("tweet_queue")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queueErr) throw new Error(queueErr.message);

    // Fetch JOTD tweets from jokes table
    const { data: jotdData } = await supabase()
      .from("jokes")
      .select("id, question, slug, emoji, last_tweeted_at, last_tweet_id, joke_of_day_date")
      .not("last_tweet_id", "is", null)
      .order("last_tweeted_at", { ascending: false })
      .limit(limit);

    // Map JOTD jokes into the same shape as tweet_queue entries
    const jotdTweets = (jotdData || []).map((j) => ({
      id: `jotd-${j.id}`,
      topic: "jotd",
      type: "jotd",
      text: `${j.emoji} ${j.question}`,
      cta_url: `https://pixiewire.com/jokes/${j.slug}`,
      source_url: null,
      tweet_id: j.last_tweet_id,
      status: "posted",
      scheduled_at: null,
      posted_at: j.last_tweeted_at,
      failed_at: null,
      error_message: null,
      batch: null,
      created_at: j.last_tweeted_at,
      // Metrics will be null — JOTD doesn't track these yet
      impressions: null,
      likes: null,
      retweets: null,
      replies: null,
      bookmarks: null,
      metrics_updated_at: null,
    }));

    // Merge and sort by date descending
    const all = [...(queueData || []), ...jotdTweets]
      .sort((a, b) => new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime())
      .slice(0, limit);

    return NextResponse.json({ tweets: all, total: (queueData?.length || 0) + jotdTweets.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
