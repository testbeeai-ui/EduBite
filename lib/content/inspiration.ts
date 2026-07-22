import {
  DID_YOU_KNOW,
  INSPIRATION_PHENOMENA,
  INSPIRATION_QUOTES,
  ROLE_MODEL,
  toRoleModel,
  type RoleModel,
} from "@/data/inspiration";
import type { InspirationPhenomenon } from "@/data/inspiration-phenomena";
import type { InspirationQuote } from "@/data/inspiration-quotes";
import {
  INSPIRATION_ROLE_MODELS,
  type InspirationRoleModel,
} from "@/data/inspiration-role-models";
import {
  todayPhenomenon,
  todayQuote,
  todayRoleModel,
  toDidYouKnowBlock,
} from "@/lib/inspiration/daily";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import { todayKey } from "@/lib/utils";

export type InspirationPayload = {
  dateKey: string;
  quote: string;
  roleModel: RoleModel;
  didYouKnow: typeof DID_YOU_KNOW;
  source: "supabase" | "static";
};

type CatalogCache = {
  loadedAt: number;
  quotes: readonly InspirationQuote[];
  phenomena: readonly InspirationPhenomenon[];
  roleModels: readonly InspirationRoleModel[];
  source: "supabase" | "static";
};

type DayCache = {
  dateKey: string;
  payload: InspirationPayload;
  expiresAt: number;
};

/** Process-local catalog cache — shared across requests on this instance. */
const CATALOG_TTL_MS = 60 * 60 * 1000;
/** Today's slim payload — all users share the same day content. */
const DAY_TTL_MS = 5 * 60 * 1000;

let catalogCache: CatalogCache | null = null;
let catalogInflight: Promise<CatalogCache> | null = null;
let dayCache: DayCache | null = null;

function mapPhenomenonRow(
  row: Record<string, unknown>,
  index: number,
): InspirationPhenomenon {
  return {
    contentKey: String(row.content_key ?? `database-phenomenon-${index}`),
    volume: Number(row.volume ?? 1),
    number: Number(row.number ?? index + 1),
    subject: String(row.subject ?? "General"),
    icon: String(row.icon ?? "✨"),
    badge: String(row.badge ?? `QUESTION ${index + 1}`),
    question: String(row.question ?? ""),
    explanation: String(row.explanation ?? ""),
    linkedConcepts: String(row.linked_concepts ?? ""),
    followUpQuestion: String(row.follow_up_question ?? ""),
    source: String(row.source ?? "database"),
  };
}

function mapRoleModelRow(
  row: Record<string, unknown>,
  index: number,
): InspirationRoleModel {
  return {
    contentKey: String(row.content_key ?? `database-role-model-${index}`),
    volume: Number(row.volume ?? 1),
    number: Number(row.number ?? index + 1),
    index: String(row.index_label ?? String(index + 1).padStart(2, "0")),
    avatar: String(row.avatar ?? "✨"),
    name: String(row.name ?? ""),
    tag: String(row.tag ?? ""),
    quote: String(row.quote ?? ""),
    bio: String(row.bio ?? ""),
    inspireWhy: String(row.inspire_why ?? ""),
    pcmConnections: String(row.pcm_connections ?? ""),
  };
}

function staticCatalog(): CatalogCache {
  return {
    loadedAt: Date.now(),
    quotes: INSPIRATION_QUOTES,
    phenomena: INSPIRATION_PHENOMENA,
    roleModels: INSPIRATION_ROLE_MODELS,
    source: "static",
  };
}

function buildDayPayload(
  catalog: CatalogCache,
  dateKey: string,
): InspirationPayload {
  const quote = todayQuote(catalog.quotes).quote;
  let didYouKnow = toDidYouKnowBlock(todayPhenomenon(catalog.phenomena));
  if (catalog.phenomena.length === 0) {
    didYouKnow = DID_YOU_KNOW;
  }
  const roleModel =
    catalog.roleModels.length > 0
      ? toRoleModel(todayRoleModel(catalog.roleModels))
      : ROLE_MODEL;

  return {
    dateKey,
    quote,
    roleModel,
    didYouKnow,
    source: catalog.source,
  };
}

async function loadCatalogs(): Promise<CatalogCache> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.loadedAt < CATALOG_TTL_MS) {
    return catalogCache;
  }
  if (catalogInflight) return catalogInflight;

  catalogInflight = (async () => {
    try {
      const supabase = await createEdubiteSupabaseServer();
      const [{ data: quotes }, { data: phenomena }, { data: roleModels }] =
        await Promise.all([
          supabase
            .from("edubite_inspiration_quotes")
            .select("content_key, category, quote, sort_order")
            .order("sort_order", { ascending: true }),
          supabase
            .from("edubite_inspiration_phenomena")
            .select(
              "content_key, volume, number, subject, icon, badge, question, explanation, linked_concepts, follow_up_question, source, sort_order",
            )
            .order("sort_order", { ascending: true }),
          supabase
            .from("edubite_inspiration_role_models")
            .select(
              "content_key, volume, number, index_label, avatar, name, tag, quote, bio, inspire_why, pcm_connections, sort_order",
            )
            .order("sort_order", { ascending: true }),
        ]);

      const quoteList: readonly InspirationQuote[] =
        quotes && quotes.length > 0
          ? quotes.map((row, index) => ({
              contentKey: String(row.content_key ?? `database-quote-${index}`),
              category: String(row.category ?? "General"),
              quote: String(row.quote),
            }))
          : INSPIRATION_QUOTES;

      const phenomenonList: readonly InspirationPhenomenon[] =
        phenomena && phenomena.length > 0
          ? phenomena.map((row, index) =>
              mapPhenomenonRow(row as Record<string, unknown>, index),
            )
          : INSPIRATION_PHENOMENA;

      const roleModelList: readonly InspirationRoleModel[] =
        roleModels && roleModels.length > 0
          ? roleModels.map((row, index) =>
              mapRoleModelRow(row as Record<string, unknown>, index),
            )
          : INSPIRATION_ROLE_MODELS;

      const next: CatalogCache = {
        loadedAt: Date.now(),
        quotes: quoteList,
        phenomena: phenomenonList,
        roleModels: roleModelList,
        source:
          (quotes && quotes.length > 0) ||
          (phenomena && phenomena.length > 0) ||
          (roleModels && roleModels.length > 0)
            ? "supabase"
            : "static",
      };
      catalogCache = next;
      return next;
    } catch (err) {
      console.warn("[loadInspiration catalogs]", err);
      const fallback = staticCatalog();
      catalogCache = fallback;
      return fallback;
    } finally {
      catalogInflight = null;
    }
  })();

  return catalogInflight;
}

/**
 * Inspiration of the day — slim payload only.
 * Catalogs load at most once per hour per server instance; day payload cached 5 min.
 */
export async function loadInspiration(): Promise<InspirationPayload> {
  const dateKey = todayKey();
  const now = Date.now();
  if (
    dayCache &&
    dayCache.dateKey === dateKey &&
    dayCache.expiresAt > now
  ) {
    return dayCache.payload;
  }

  try {
    const catalog = await loadCatalogs();
    const payload = buildDayPayload(catalog, dateKey);
    dayCache = {
      dateKey,
      payload,
      expiresAt: now + DAY_TTL_MS,
    };
    return payload;
  } catch (err) {
    console.warn("[loadInspiration]", err);
    return {
      dateKey,
      quote: todayQuote().quote,
      roleModel: toRoleModel(todayRoleModel()),
      didYouKnow: DID_YOU_KNOW,
      source: "static",
    };
  }
}
