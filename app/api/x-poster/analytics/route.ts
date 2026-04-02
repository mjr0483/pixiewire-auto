import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

function getPostizClient(): TwitterApi {
  const [accessToken, accessSecret] = (process.env.POSTIZ_X_ACCESS_TOKEN_FULL || "").split(":");
  return new TwitterApi({
    appKey: process.env.POSTIZ_X_API_KEY!,
    appSecret: process.env.POSTIZ_X_API_SECRET!,
    accessToken,
    accessSecret,
  });
}

export async function GET() {
  try {
    if (!process.env.POSTIZ_X_API_KEY || !process.env.POSTIZ_X_ACCESS_TOKEN_FULL) {
      return NextResponse.json({ ok: false, error: "Postiz X credentials not configured" });
    }

    const client = getPostizClient();

    // Get user info
    const me = await client.v2.me();
    const userId = me.data.id;

    // Get recent tweets with metrics
    const timeline = await client.v2.userTimeline(userId, {
      max_results: 20,
      exclude: ["retweets", "replies"],
      "tweet.fields": ["public_metrics", "created_at"],
    });

    const tweets = (timeline.data.data || []).map((t) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      impressions: t.public_metrics?.impression_count || 0,
      likes: t.public_metrics?.like_count || 0,
      retweets: t.public_metrics?.retweet_count || 0,
      replies: t.public_metrics?.reply_count || 0,
      quotes: t.public_metrics?.quote_count || 0,
      bookmarks: t.public_metrics?.bookmark_count || 0,
    }));

    const totals = tweets.reduce(
      (acc, t) => ({
        impressions: acc.impressions + t.impressions,
        likes: acc.likes + t.likes,
        retweets: acc.retweets + t.retweets,
        replies: acc.replies + t.replies,
        bookmarks: acc.bookmarks + t.bookmarks,
      }),
      { impressions: 0, likes: 0, retweets: 0, replies: 0, bookmarks: 0 },
    );

    return NextResponse.json({ ok: true, tweets, totals, count: tweets.length });
  } catch (e: any) {
    const msg = e?.data?.detail || e?.message || String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
