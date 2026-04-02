import { NextResponse } from "next/server";
import { signOAuthRequest } from "@/lib/x-api";

function getPostizCredentials() {
  return {
    api_key: process.env.POSTIZ_X_API_KEY!,
    api_secret: process.env.POSTIZ_X_API_SECRET!,
    access_token: process.env.POSTIZ_X_ACCESS_TOKEN!,
    access_token_secret: process.env.POSTIZ_X_ACCESS_TOKEN_SECRET!,
  };
}

export async function GET() {
  try {
    const creds = getPostizCredentials();
    if (!creds.api_key || !creds.access_token) {
      return NextResponse.json({ ok: false, error: "Postiz X credentials not configured" });
    }

    // Get user ID first
    const meUrl = "https://api.twitter.com/2/users/me";
    const meHeaders = signOAuthRequest("GET", meUrl, creds);
    const meRes = await fetch(meUrl, { headers: meHeaders });
    if (!meRes.ok) {
      const body = await meRes.text();
      return NextResponse.json({ ok: false, error: `User lookup failed: ${meRes.status} ${body}` });
    }
    const meData = await meRes.json();
    const userId = meData.data?.id;

    // Get recent tweets with metrics
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=20&tweet.fields=created_at,public_metrics&exclude=retweets,replies`;
    const tweetsHeaders = signOAuthRequest("GET", tweetsUrl, creds);
    const tweetsRes = await fetch(tweetsUrl, { headers: tweetsHeaders });

    if (!tweetsRes.ok) {
      const body = await tweetsRes.text();
      return NextResponse.json({ ok: false, error: `Tweets fetch failed: ${tweetsRes.status} ${body}` });
    }

    const tweetsData = await tweetsRes.json();
    const tweets = (tweetsData.data || []).map((t: any) => ({
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

    // Compute totals
    const totals = tweets.reduce(
      (acc: any, t: any) => ({
        impressions: acc.impressions + t.impressions,
        likes: acc.likes + t.likes,
        retweets: acc.retweets + t.retweets,
        replies: acc.replies + t.replies,
        bookmarks: acc.bookmarks + t.bookmarks,
      }),
      { impressions: 0, likes: 0, retweets: 0, replies: 0, bookmarks: 0 },
    );

    return NextResponse.json({ ok: true, tweets, totals, count: tweets.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
