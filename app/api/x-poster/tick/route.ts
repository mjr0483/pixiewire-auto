import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSettings, getTodayQueue, insertTweet, updateTweet, updateSettings } from "@/lib/supabase";
import { getTodayET, getTodayStartET, getCurrentTimeET, getScheduledTimestampUTC } from "@/lib/eastern-time";
import { generateTweet } from "@/lib/claude";
import { resolveContentTypes, buildPrompt } from "@/lib/content-types";
import { postTweet, getXCredentials } from "@/lib/x-api";
import { sendPushover } from "@/lib/pushover";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const actions: string[] = [];

  try {
    const settings = await getSettings();

    if (!settings.posting_enabled) {
      await updateSettings({ last_tick_at: new Date().toISOString(), last_tick_result: { actions: ["Posting disabled"] } } as any);
      return NextResponse.json({ ok: true, actions: ["Posting disabled"] });
    }

    const schedule = settings.active_posting_windows;
    if (!schedule?.schedule?.length) {
      await updateSettings({ last_tick_at: new Date().toISOString(), last_tick_result: { actions: ["No schedule configured"] } } as any);
      return NextResponse.json({ ok: true, actions: ["No schedule configured"] });
    }

    const contentTypes = resolveContentTypes(settings.content_types);
    const todayStart = getTodayStartET();
    const todayET = getTodayET();
    const currentTime = getCurrentTimeET();
    const queue = await getTodayQueue(todayStart);
    const leadMinutes = settings.generation_lead_minutes || 10;

    const [currentH, currentM] = currentTime.split(":").map(Number);
    const currentTotalMinutes = currentH * 60 + currentM;

    for (const slot of schedule.schedule) {
      const [slotH, slotM] = slot.time.split(":").map(Number);
      const slotTotalMinutes = slotH * 60 + slotM;
      const minutesUntilSlot = slotTotalMinutes - currentTotalMinutes;

      const existingTweet = queue.find((q) => q.batch === String(slot.slot));

      if (minutesUntilSlot <= leadMinutes && minutesUntilSlot > -5 && !existingTweet) {
        const ct = contentTypes.find((t) => t.id === slot.content_type);
        if (!ct) {
          actions.push(`Slot ${slot.slot}: unknown content type ${slot.content_type}`);
          continue;
        }

        try {
          const prompt = buildPrompt(settings.grok_prompt || "", ct, currentTime);
          const model = settings.generation_model || "claude-haiku-4-5-20251001";
          const text = await generateTweet(prompt, model);
          const scheduledAt = getScheduledTimestampUTC(slot.time, todayET);

          await insertTweet({
            topic: ct.label,
            type: ct.id,
            text,
            status: "scheduled",
            scheduled_at: scheduledAt,
            batch: String(slot.slot),
          });

          actions.push(`Slot ${slot.slot}: generated "${text.slice(0, 50)}..."`);
        } catch (e) {
          actions.push(`Slot ${slot.slot}: generation failed — ${(e as Error).message}`);
        }
      }

      if (existingTweet && existingTweet.status === "scheduled" && existingTweet.scheduled_at) {
        const scheduledTime = new Date(existingTweet.scheduled_at);
        if (scheduledTime <= new Date()) {
          try {
            const credentials = getXCredentials();
            const result = await postTweet(credentials, existingTweet.text);
            await updateTweet(existingTweet.id, {
              status: "posted",
              posted_at: new Date().toISOString(),
              tweet_id: result.id,
            } as any);
            actions.push(`Slot ${slot.slot}: posted to X`);
            await sendPushover({
              title: "Tweet Posted",
              message: `Post ${slot.slot} — ${slot.time} ET — ${slot.content_type}\n${existingTweet.text.slice(0, 120)}`,
              url: `https://x.com/PixieWireNews/status/${result.id}`,
              url_title: "View on X",
            });
          } catch (e) {
            await updateTweet(existingTweet.id, {
              status: "failed",
              failed_at: new Date().toISOString(),
              error_message: (e as Error).message,
            });
            actions.push(`Slot ${slot.slot}: post failed — ${(e as Error).message}`);
            await sendPushover({
              title: "Tweet Failed",
              message: `Post ${slot.slot} — ${slot.time} ET — ${slot.content_type}\nError: ${(e as Error).message.slice(0, 100)}`,
              priority: 1,
              sound: "falling",
            });
          }
        }
      }
    }

    if (actions.length === 0) {
      actions.push("No actions needed this tick");
    }

    // Record tick result for dashboard visibility
    await updateSettings({ last_tick_at: new Date().toISOString(), last_tick_result: { actions } } as any);

    return NextResponse.json({ ok: true, actions });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, actions }, { status: 500 });
  }
}
