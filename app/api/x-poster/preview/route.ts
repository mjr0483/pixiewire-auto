import { NextRequest, NextResponse } from "next/server";
import { getSettings, insertTweet } from "@/lib/supabase";
import { generateTweet } from "@/lib/claude";
import { resolveContentTypes, buildPrompt } from "@/lib/content-types";
import { getCurrentTimeET } from "@/lib/eastern-time";
import { postTweet, getXCredentials } from "@/lib/x-api";
import { sendPushover } from "@/lib/pushover";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, content_type, text } = body;

    const settings = await getSettings();
    const contentTypes = resolveContentTypes(settings.content_types);
    const ct = contentTypes.find((t) => t.id === content_type);

    if (action === "generate") {
      if (!ct) {
        return NextResponse.json({ ok: false, error: `Unknown content type: ${content_type}` });
      }
      const prompt = buildPrompt(settings.grok_prompt || "", ct, getCurrentTimeET());
      const model = settings.generation_model || "claude-haiku-4-5-20251001";
      const generated = await generateTweet(prompt, model);
      return NextResponse.json({ ok: true, text: generated, content_type: ct.id });
    }

    if (action === "publish") {
      if (!text) {
        return NextResponse.json({ ok: false, error: "No tweet text provided" });
      }
      const credentials = getXCredentials();
      const result = await postTweet(credentials, text);

      await insertTweet({
        topic: ct?.label || content_type,
        type: content_type || "manual",
        text,
        status: "posted",
        posted_at: new Date().toISOString(),
        batch: "on-demand",
        tweet_id: result.id,
      } as any);

      await sendPushover({
        title: "On-Demand Tweet Posted",
        message: `${ct?.label || content_type}\n${text.slice(0, 140)}`,
        url: `https://x.com/PixieWireNews/status/${result.id}`,
        url_title: "View on X",
      });

      return NextResponse.json({
        ok: true,
        tweet_id: result.id,
        tweet_url: `https://x.com/PixieWireNews/status/${result.id}`,
      });
    }

    return NextResponse.json({ ok: false, error: `Unknown action: ${action}` });
  } catch (e: any) {
    await sendPushover({
      title: "Tweet Publish Failed",
      message: e?.message?.slice(0, 140) || "Unknown error",
      priority: 1,
      sound: "falling",
    });
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
