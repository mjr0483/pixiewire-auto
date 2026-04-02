import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabase } from "@/lib/supabase-client";

function getClient(): TwitterApi {
  const [accessToken, accessSecret] = (process.env.POSTIZ_X_ACCESS_TOKEN_FULL || "").split(":");
  return new TwitterApi({
    appKey: process.env.POSTIZ_X_API_KEY!,
    appSecret: process.env.POSTIZ_X_API_SECRET!,
    accessToken,
    accessSecret,
  });
}

export async function POST() {
  try {
    const client = getClient();

    // Get all posted tweets with tweet_ids
    const { data: postedTweets, error } = await supabase()
      .from("tweet_queue")
      .select("id, tweet_id")
      .eq("status", "posted")
      .not("tweet_id", "is", null)
      .order("posted_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    if (!postedTweets || postedTweets.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, deleted: 0, updated: 0 });
    }

    const tweetIds = postedTweets.map((t) => t.tweet_id).filter(Boolean);
    let deletedCount = 0;
    let updatedCount = 0;

    // Check in batches of 100
    for (let i = 0; i < tweetIds.length; i += 100) {
      const batch = tweetIds.slice(i, i + 100);
      try {
        const lookup = await client.v2.tweets(batch, {
          "tweet.fields": ["public_metrics", "created_at"],
        });

        const foundMap = new Map<string, any>();
        for (const t of (lookup.data || [])) {
          foundMap.set(t.id, t);
        }

        for (const tweetId of batch) {
          const dbRow = postedTweets.find((t) => t.tweet_id === tweetId);
          if (!dbRow) continue;

          if (!foundMap.has(tweetId)) {
            // Tweet deleted from X
            await supabase()
              .from("tweet_queue")
              .update({ status: "deleted" })
              .eq("id", dbRow.id);
            deletedCount++;
          } else {
            // Update metrics
            const metrics = foundMap.get(tweetId)?.public_metrics;
            if (metrics) {
              await supabase()
                .from("tweet_queue")
                .update({
                  impressions: metrics.impression_count || 0,
                  likes: metrics.like_count || 0,
                  retweets: metrics.retweet_count || 0,
                  replies: metrics.reply_count || 0,
                  bookmarks: metrics.bookmark_count || 0,
                  metrics_updated_at: new Date().toISOString(),
                })
                .eq("id", dbRow.id);
              updatedCount++;
            }
          }
        }
      } catch (e) {
        console.error("Audit batch failed:", e);
      }
    }

    return NextResponse.json({ ok: true, checked: tweetIds.length, deleted: deletedCount, updated: updatedCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
