import { NextRequest, NextResponse } from "next/server";
import { sendPushover } from "@/lib/pushover";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");

  const title = source === "dashboard" ? "PixieWire Dashboard" : "PixieWire Auto";
  const message = source === "dashboard"
    ? "Test from PixieWire Dashboard. Pushover is connected."
    : "Pushover is connected. Breaking news alerts will appear here.";

  const result = await sendPushover({ title, message, sound: "pushover" });

  return NextResponse.json(result, { headers: corsHeaders() });
}
