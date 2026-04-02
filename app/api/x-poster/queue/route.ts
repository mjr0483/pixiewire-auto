import { NextRequest, NextResponse } from "next/server";
import { getTodayQueue, updateTweet } from "@/lib/supabase";
import { getTodayStartET } from "@/lib/eastern-time";

export async function GET() {
  try {
    const todayStart = getTodayStartET();
    const queue = await getTodayQueue(todayStart);
    return NextResponse.json({ queue });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();

    if (action === "skip") {
      await updateTweet(id, { status: "skipped" });
    } else if (action === "delete") {
      await updateTweet(id, { status: "deleted" });
    } else if (action === "regenerate") {
      await updateTweet(id, { status: "pending", text: "", error_message: null, failed_at: null });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
