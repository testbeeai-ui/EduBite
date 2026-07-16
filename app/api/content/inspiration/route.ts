import { NextResponse } from "next/server";
import { loadInspiration } from "@/lib/content/inspiration";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await loadInspiration();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/content/inspiration]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
