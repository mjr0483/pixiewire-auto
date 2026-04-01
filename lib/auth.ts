import { NextRequest, NextResponse } from "next/server";

export function requireAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.AUTO_API_KEY;

  if (!expected) return null;

  if (!authHeader || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
