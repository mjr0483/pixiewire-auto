import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { postTweet, getXCredentials } from "@/lib/x-api";
import { updateTweet } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let tweetId: string | null = null;

  try {
    const body = await req.json();
    tweetId = body.tweet_id || null;
    const credentials = getXCredentials();
    const result = await postTweet(credentials, body.text);

    if (tweetId) {
      await updateTweet(tweetId, {
        status: "posted",
        posted_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, tweet: result });
  } catch (e) {
    if (tweetId) {
      await updateTweet(tweetId, {
        status: "failed",
        failed_at: new Date().toISOString(),
        error_message: (e as Error).message,
      });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
