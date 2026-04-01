import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/supabase";
import { generateTweet } from "@/lib/claude";
import { getContentType, buildPrompt } from "@/lib/content-types";
import { getCurrentTimeET } from "@/lib/eastern-time";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const { content_type } = await req.json();
    const settings = await getSettings();
    const ct = getContentType(content_type);
    if (!ct) {
      return NextResponse.json({ error: `Unknown content type: ${content_type}` }, { status: 400 });
    }

    const prompt = buildPrompt(settings.grok_prompt || "", ct, getCurrentTimeET());
    const model = settings.generation_model || "claude-haiku-4-5-20251001";
    const text = await generateTweet(prompt, model);

    return NextResponse.json({ text, content_type: ct.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
