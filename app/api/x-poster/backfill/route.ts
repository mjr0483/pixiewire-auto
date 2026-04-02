import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabase } from "@/lib/supabase-client";

export async function POST() {
  try {
    const [accessToken, accessSecret] = (process.env.POSTIZ_X_ACCESS_TOKEN_FULL || "").split(":");
    const client = new TwitterApi({
      appKey: process.env.POSTIZ_X_API_KEY!,
      appSecret: process.env.POSTIZ_X_API_SECRET!,
      accessToken,
      accessSecret,
    });

    const me = await client.v2.me();
    const timeline = await client.v2.userTimeline(me.data.id, {
      max_results: 100,
      exclude: ["retweets", "replies"],
      "tweet.fields": ["created_at"],
    });

    const xTweets = timeline.data.data || [];

    // Get all queue rows missing tweet_id
    const { data: queueRows } = await supabase()
      .from("tweet_queue")
      .select("id, text, tweet_id")
      .is("tweet_id", null)
      .eq("status", "posted");

    if (!queueRows || queueRows.length === 0) {
      return NextResponse.json({ ok: true, matched: 0, message: "No rows to backfill" });
    }

    let matched = 0;
    for (const row of queueRows) {
      // Match by text content (tweet text may be truncated by X)
      const match = xTweets.find((xt) => {
        const rowText = row.text.slice(0, 100);
        const xtText = xt.text.slice(0, 100);
        return rowText === xtText || xt.text.startsWith(row.text.slice(0, 50));
      });

      if (match) {
        await supabase()
          .from("tweet_queue")
          .update({ tweet_id: match.id })
          .eq("id", row.id);
        matched++;
      }
    }

    return NextResponse.json({ ok: true, matched, total: queueRows.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.data?.detail || e?.message || String(e) }, { status: 500 });
  }
}
