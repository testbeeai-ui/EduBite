import { INSPIRATION_QUOTES } from "@/data/inspiration-quotes";
import { INSPIRATION_PHENOMENA } from "@/data/inspiration-phenomena";
import {
  INSPIRATION_ROLE_MODELS,
  type InspirationRoleModel,
} from "@/data/inspiration-role-models";
import {
  todayPhenomenon,
  toDidYouKnowBlock,
} from "@/lib/inspiration/daily";

export { INSPIRATION_QUOTES, INSPIRATION_PHENOMENA, INSPIRATION_ROLE_MODELS };
export type { InspirationRoleModel };

export const QUOTES = INSPIRATION_QUOTES.map(({ quote }) => quote);

export type RoleModel = {
  index: string;
  avatar: string;
  /** Unused in UI — portraits are not stored or displayed. */
  image: string;
  name: string;
  tag: string;
  quote: string;
  bio: string;
  inspireWhy: string;
  pcmConnections: string;
};

export function toRoleModel(profile: InspirationRoleModel): RoleModel {
  return {
    index: profile.index,
    avatar: profile.avatar,
    image: "",
    name: profile.name,
    tag: profile.tag,
    quote: profile.quote,
    bio: profile.bio,
    inspireWhy: profile.inspireWhy,
    pcmConnections: profile.pcmConnections,
  };
}

/** Static fallback = first catalog profile (Aryabhata). */
export const ROLE_MODEL: RoleModel = toRoleModel(INSPIRATION_ROLE_MODELS[0]!);

/** Merge DB/static payloads so older role_model rows still render the full profile. */
export function normalizeRoleModel(raw: unknown): RoleModel {
  if (!raw || typeof raw !== "object") return ROLE_MODEL;
  const row = raw as Record<string, unknown>;
  const quote = typeof row.quote === "string" ? row.quote.trim() : "";
  const inspireWhy =
    typeof row.inspireWhy === "string" ? row.inspireWhy.trim() : "";
  const pcmConnections =
    typeof row.pcmConnections === "string" ? row.pcmConnections.trim() : "";
  const bio = typeof row.bio === "string" ? row.bio.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";

  if (!quote || !inspireWhy || !pcmConnections || !bio || !name) {
    return ROLE_MODEL;
  }

  return {
    index:
      typeof row.index === "string" && row.index.trim()
        ? row.index.trim()
        : ROLE_MODEL.index,
    avatar:
      typeof row.avatar === "string" && row.avatar.trim()
        ? row.avatar.trim()
        : ROLE_MODEL.avatar,
    image: "",
    name,
    tag:
      typeof row.tag === "string" && row.tag.trim()
        ? row.tag.trim()
        : ROLE_MODEL.tag,
    quote,
    bio,
    inspireWhy,
    pcmConnections,
  };
}

export const DID_YOU_KNOW = toDidYouKnowBlock(todayPhenomenon());
