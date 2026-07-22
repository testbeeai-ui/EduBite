import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { createEdubiteSupabaseMiddleware } from "@/lib/supabase/middleware";

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith("sb-")) continue;
    response.cookies.set(cookie.name, "", {
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

/**
 * Production-style session cookie refresh for Edubite.
 * Does NOT change guest-home / client requireAuth gating — only keeps cookies fresh.
 */
export async function middleware(request: NextRequest) {
  // Dev: keep one cookie host (localhost vs 127.0.0.1 are different origins).
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host") ?? "";
    if (host.startsWith("127.0.0.1")) {
      const url = request.nextUrl.clone();
      url.hostname = "localhost";
      return NextResponse.redirect(url, 307);
    }
  }

  const pathname = request.nextUrl.pathname;

  // Drop sticky failed-login query so Fast Refresh does not keep replaying it.
  if (
    (pathname === "/" || pathname === "" || pathname === "/login") &&
    request.nextUrl.searchParams.has("auth_error")
  ) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("auth_error");
    url.hash = "";
    return NextResponse.redirect(url, 307);
  }

  // Google sometimes returns to Site URL with ?code= instead of /auth/callback.
  const oauthCode = request.nextUrl.searchParams.get("code");
  if (
    oauthCode &&
    oauthCode.length >= 16 &&
    (pathname === "/" || pathname === "")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url, 307);
  }

  // Let the callback route exchange the code itself (do not touch cookies here).
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  // API routes enforce their own auth; avoid double refresh there.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  try {
    const { supabase, getResponse } = createEdubiteSupabaseMiddleware(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const response = getResponse();
    // Mark denied admins for observability; UI still renders Access denied.
    if (pathname.startsWith("/admin") && user && !isAdminEmail(user.email)) {
      response.headers.set("x-edubite-admin", "denied");
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[middleware] session refresh skipped", message);
    // Corrupt/empty sb-* cookies cause "Unexpected end of JSON input" → wipe and continue.
    if (
      message.includes("JSON") ||
      message.includes("Unexpected end") ||
      message.includes("parse")
    ) {
      return clearAuthCookies(NextResponse.next({ request }), request);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
