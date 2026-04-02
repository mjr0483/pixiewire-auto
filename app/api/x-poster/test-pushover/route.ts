import { NextResponse } from "next/server";
import { sendPushover } from "@/lib/pushover";

export async function GET() {
  const result = await sendPushover({
    title: "PixieWire Auto",
    message: "Pushover is connected. Breaking news alerts will appear here.",
    sound: "pushover",
  });

  return NextResponse.json(result);
}
