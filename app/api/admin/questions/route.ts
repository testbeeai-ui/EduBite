import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createContentQuestion,
  listContentQuestions,
  validateQuestionInput,
  type ContentDomain,
  type ContentQuestionInput,
} from "@/lib/db/content-questions";

export const runtime = "nodejs";

function parseDomain(raw: string | null): ContentDomain | undefined {
  if (raw === "dailydose" || raw === "funbrain") return raw;
  return undefined;
}

export async function GET(request: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const domain = parseDomain(url.searchParams.get("domain"));
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const questions = await listContentQuestions({ domain, from, to });
    return NextResponse.json({
      questions,
      table: "edubite_content_questions",
    });
  } catch (err) {
    console.error("[api/admin/questions GET]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const input = body as ContentQuestionInput;
    const error = validateQuestionInput(input);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const question = await createContentQuestion(input, gate.user.id);
    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/questions POST]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
