import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/supabase";
import { sendPushover } from "@/lib/pushover";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSettings(body);

    if ("posting_enabled" in body) {
      await sendPushover({
        title: "Auto-Poster",
        message: body.posting_enabled ? "Posting ENABLED" : "Posting DISABLED",
        sound: body.posting_enabled ? "pushover" : "none",
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
