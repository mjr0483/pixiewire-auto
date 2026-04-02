import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_INTERNAL_URL || "http://n8n:5678";
const WORKFLOW_ID = "WlQYAH7URIYLiCJR";

function getN8nKey(): string {
  return process.env.N8N_API_KEY || "";
}

export async function GET() {
  try {
    const res = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { "X-N8N-API-KEY": getN8nKey() },
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `n8n ${res.status}` });
    const data = await res.json();
    return NextResponse.json({ ok: true, active: data.active });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { active } = await req.json();
    const endpoint = active ? "activate" : "deactivate";
    const res = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}/${endpoint}`, {
      method: "POST",
      headers: { "X-N8N-API-KEY": getN8nKey() },
    });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ ok: false, error: `n8n ${res.status}: ${body}` });
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, active: data.active });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
