import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  deleteContentQuestion,
  getContentQuestionById,
  updateContentQuestion,
  validateQuestionInput,
  type ContentQuestionInput,
} from "@/lib/db/content-questions";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { id } = await context.params;
    const question = await getContentQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ question });
  } catch (err) {
    console.error("[api/admin/questions/[id] GET]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { id } = await context.params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const existing = await getContentQuestionById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const patch = body as Partial<ContentQuestionInput>;
    const merged: ContentQuestionInput = {
      domain: patch.domain ?? existing.domain,
      classLevel:
        patch.classLevel !== undefined ? patch.classLevel : existing.classLevel,
      activeDate: patch.activeDate ?? existing.activeDate,
      tag: patch.tag !== undefined ? patch.tag : existing.tag,
      q: patch.q ?? existing.q,
      opts: patch.opts ?? existing.opts,
      correct: patch.correct ?? existing.correct,
      sortOrder: patch.sortOrder ?? existing.sortOrder,
      published: patch.published ?? existing.published,
    };

    const error = validateQuestionInput(merged);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const question = await updateContentQuestion(id, patch);
    return NextResponse.json({ question });
  } catch (err) {
    console.error("[api/admin/questions/[id] PATCH]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { id } = await context.params;
    const deleted = await deleteContentQuestion(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/questions/[id] DELETE]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
