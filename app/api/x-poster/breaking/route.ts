import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { postTweet, getXCredentials } from "@/lib/x-api";
import { sendPushover } from "@/lib/pushover";
import { sanitizeTweet } from "@/lib/sanitize";

// POST: Log a breaking news finding with draft tweet
export async function POST(req: NextRequest) {
  try {
    const { headline, source_url, draft_tweet } = await req.json();

    if (!headline || !draft_tweet) {
      return NextResponse.json({ ok: false, error: "headline and draft_tweet required" });
    }

    // Check if we already logged this headline
    const { data: existing } = await supabase()
      .from("tweet_queue")
      .select("id")
      .eq("topic", headline)
      .eq("type", "breaking")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true, message: "Already logged" });
    }

    const clean = sanitizeTweet(draft_tweet);

    const { data, error } = await supabase()
      .from("tweet_queue")
      .insert({
        topic: headline,
        type: "breaking",
        text: clean,
        source_url: source_url || null,
        status: "monitor",
        batch: "breaking",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// PUT: Publish a breaking tweet (from the UI "Post to X" button)
export async function PUT(req: NextRequest) {
  try {
    const { id, text } = await req.json();

    if (!id || !text) {
      return NextResponse.json({ ok: false, error: "id and text required" });
    }

    const clean = sanitizeTweet(text);
    const credentials = getXCredentials();
    const result = await postTweet(credentials, clean);

    await supabase()
      .from("tweet_queue")
      .update({
        text: clean,
        status: "posted",
        posted_at: new Date().toISOString(),
        tweet_id: result.id,
      })
      .eq("id", id);

    await sendPushover({
      title: "Breaking Tweet Posted",
      message: clean.slice(0, 140),
      url: `https://x.com/PixieWireNews/status/${result.id}`,
      url_title: "View on X",
    });

    return NextResponse.json({ ok: true, tweet_url: `https://x.com/PixieWireNews/status/${result.id}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// GET: List breaking findings
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("tweet_queue")
      .select("*")
      .eq("type", "breaking")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, findings: data || [] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
