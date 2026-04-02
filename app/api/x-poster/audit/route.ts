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

    // Get all posted tweets with tweet_ids from the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: postedTweets, error } = await supabase()
      .from("tweet_queue")
      .select("id, tweet_id, text")
      .eq("status", "posted")
      .not("tweet_id", "is", null)
      .gte("posted_at", weekAgo);

    if (error) throw new Error(error.message);
    if (!postedTweets || postedTweets.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, deleted: 0 });
    }

    // Check tweets in batches of 100 (X API limit)
    const tweetIds = postedTweets.map((t) => t.tweet_id).filter(Boolean);
    let deletedCount = 0;

    for (let i = 0; i < tweetIds.length; i += 100) {
      const batch = tweetIds.slice(i, i + 100);
      try {
        const lookup = await client.v2.tweets(batch);
        const foundIds = new Set((lookup.data || []).map((t) => t.id));

        // Any tweet_id not in the response has been deleted
        for (const id of batch) {
          if (!foundIds.has(id)) {
            const dbRow = postedTweets.find((t) => t.tweet_id === id);
            if (dbRow) {
              await supabase()
                .from("tweet_queue")
                .update({ status: "deleted" })
                .eq("id", dbRow.id);
              deletedCount++;
            }
          }
        }
      } catch (e) {
        // If the batch lookup fails, skip it
        console.error("Audit batch failed:", e);
      }
    }

    return NextResponse.json({ ok: true, checked: tweetIds.length, deleted: deletedCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
