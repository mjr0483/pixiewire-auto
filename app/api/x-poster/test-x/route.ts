import { NextResponse } from "next/server";
import { signOAuthRequest, getXCredentials } from "@/lib/x-api";

export async function GET() {
  try {
    const credentials = getXCredentials();
    const url = "https://api.twitter.com/2/users/me";
    const headers = signOAuthRequest("GET", url, credentials);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json({ ok: false, error: `X API ${response.status}: ${body}` });
    }

    const json = await response.json();
    return NextResponse.json({ ok: true, username: json.data?.username, name: json.data?.name });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
