import {
  DID_YOU_KNOW,
  QUOTES,
  ROLE_MODEL,
} from "@/data/inspiration";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import { getDayOfYearQuoteIndex } from "@/lib/utils";

export type InspirationPayload = {
  quote: string;
  roleModel: typeof ROLE_MODEL;
  didYouKnow: typeof DID_YOU_KNOW;
  source: "supabase" | "static";
};

/**
 * Inspiration content from edubite_inspiration_* with static fallback.
 */
export async function loadInspiration(): Promise<InspirationPayload> {
  try {
    const supabase = await createEdubiteSupabaseServer();
    const [{ data: quotes }, { data: blocks }] = await Promise.all([
      supabase
        .from("edubite_inspiration_quotes")
        .select("quote, sort_order")
        .order("sort_order", { ascending: true }),
      supabase.from("edubite_inspiration_blocks").select("id, payload"),
    ]);

    const quoteList =
      quotes && quotes.length > 0
        ? quotes.map((q) => String(q.quote))
        : QUOTES;
    const quote = quoteList[getDayOfYearQuoteIndex(quoteList.length)] ?? QUOTES[0]!;

    let roleModel = ROLE_MODEL;
    let didYouKnow = DID_YOU_KNOW;
    for (const block of blocks ?? []) {
      if (block.id === "role_model" && block.payload) {
        roleModel = block.payload as typeof ROLE_MODEL;
      }
      if (block.id === "did_you_know" && block.payload) {
        didYouKnow = block.payload as typeof DID_YOU_KNOW;
      }
    }

    return {
      quote,
      roleModel,
      didYouKnow,
      source: quotes && quotes.length > 0 ? "supabase" : "static",
    };
  } catch (err) {
    console.warn("[loadInspiration]", err);
    return {
      quote: QUOTES[getDayOfYearQuoteIndex(QUOTES.length)] ?? QUOTES[0]!,
      roleModel: ROLE_MODEL,
      didYouKnow: DID_YOU_KNOW,
      source: "static",
    };
  }
}
