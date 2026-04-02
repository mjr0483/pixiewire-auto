import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

// POST: Log an agent run
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent, slot, content_type, status, duration_ms, tweet_text, tweet_id, tweet_url, error, details } = body;

    const { data, error: dbError } = await supabase()
      .from("agent_runs")
      .insert({
        agent: agent || "tweeter",
        slot: slot || null,
        content_type: content_type || null,
        status: status || "success",
        duration_ms: duration_ms || null,
        tweet_text: tweet_text || null,
        tweet_id: tweet_id || null,
        tweet_url: tweet_url || null,
        error: error || null,
        details: details || null,
      })
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// GET: List agent runs
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const agent = req.nextUrl.searchParams.get("agent");

  try {
    let query = supabase()
      .from("agent_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (agent) query = query.eq("agent", agent);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Stats
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const todayRuns = (data || []).filter((r) => {
      const d = new Date(r.created_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      return d === today;
    });

    const stats = {
      total_today: todayRuns.length,
      success_today: todayRuns.filter((r) => r.status === "success").length,
      failed_today: todayRuns.filter((r) => r.status === "error").length,
      skipped_today: todayRuns.filter((r) => r.status === "skipped").length,
      avg_duration_ms: todayRuns.length > 0
        ? Math.round(todayRuns.filter((r) => r.duration_ms).reduce((s, r) => s + (r.duration_ms || 0), 0) / todayRuns.filter((r) => r.duration_ms).length)
        : 0,
    };

    return NextResponse.json({ ok: true, runs: data || [], stats });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
