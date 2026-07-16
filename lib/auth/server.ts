import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Resolve the signed-in user via Supabase Auth verification (getUser),
 * not an unverified local JWT decode.
 */
export async function getRequestUser(): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Never write cookies from progress routes
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.id) return null;
    return user;
  } catch (err) {
    console.warn("[getRequestUser]", err);
    return null;
  }
}
