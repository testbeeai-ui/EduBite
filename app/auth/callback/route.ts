import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Exchange Google OAuth PKCE code and set session cookies.
 * Edubite: no waitlist / whitelist — any Google account can sign in.
 * Register this exact URL in Supabase Auth → Redirect URLs:
 *   http://localhost:3000/auth/callback
 *   https://<edubite-domain>/auth/callback
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Prefer explicit next, else home. Do not rely on query in redirectTo allowlist.
  const next = url.searchParams.get("next") ?? "/";
  const finish = new URL(next.startsWith("/") ? next : "/", url.origin);
  finish.search = "";
  finish.hash = "";

  if (!code || code.length < 16) {
    return NextResponse.redirect(finish);
  }

  let response = NextResponse.redirect(finish);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.redirect(finish);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              path: options?.path ?? "/",
              sameSite: options?.sameSite ?? "lax",
            }),
          );
        },
      },
    },
  );

  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const hasVerifier = cookieNames.some(
    (n) => n.includes("code-verifier") || n.includes("code_verifier"),
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed", {
      message: error.message,
      status: error.status,
      hasVerifier,
      cookieNames: cookieNames.filter((n) => n.startsWith("sb-")),
    });
    // Stay on Edubite — never send users to EduBlast whitelist error UI.
    const fail = new URL("/login", url.origin);
    fail.hash = "auth_error=oauth_exchange_failed";
    response = NextResponse.redirect(fail);
  }

  return response;
}
