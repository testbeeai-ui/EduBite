import { NextResponse } from "next/server";

/**
 * External clients (extensions / leftover SW) poll GET /messages on :3000.
 * Without this route, those 404s compile `_not-found` and corrupt Turbopack's
 * `.next` cache on Windows (ENOENT on manifests / tmp build files).
 */
export function GET() {
  return new NextResponse(null, { status: 204 });
}
