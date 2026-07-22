"use client";

import { useState } from "react";
import type { RoleModel } from "@/data/inspiration";
import { Card } from "@/components/ui/card";

type RoleModelProfileProps = {
  roleModel: RoleModel;
};

export function RoleModelProfile({ roleModel }: RoleModelProfileProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-[var(--line)] bg-[var(--surface)] !p-0">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="mx-auto flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] border border-[var(--line)] bg-gradient-to-br from-purple/20 to-blue/15 text-[28px] sm:mx-0">
            {roleModel.avatar}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h3 className="font-display text-[24px] font-bold leading-tight text-[var(--text)] sm:text-[26px]">
              {roleModel.name}
            </h3>
            <div className="mt-1 font-mono text-[10.5px] tracking-[0.08em] text-teal">
              {roleModel.tag}
            </div>
            {roleModel.quote ? (
              <p className="mt-2 font-display text-[14px] italic leading-snug text-[var(--blue)] sm:text-[15px]">
                &ldquo;{roleModel.quote}&rdquo;
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3">
          {expanded ? (
            <div className="space-y-1 text-[13px] leading-snug text-[var(--text)]">
              {roleModel.bio
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          ) : (
            <p className="line-clamp-4 whitespace-pre-line text-[13px] leading-snug text-[var(--text)]">
              {roleModel.bio}
            </p>
          )}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 font-mono text-[11px] tracking-wide text-teal transition-colors hover:text-[var(--text)]"
          >
            {expanded ? "less" : "more"}
          </button>
        </div>

        {roleModel.inspireWhy ? (
          <div className="mt-3 rounded-xl border border-[rgba(251,191,36,0.22)] bg-[rgba(120,70,20,0.35)] px-3.5 py-3">
            <div className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[var(--amber)]">
              WHY THIS SHOULD INSPIRE CLASS XI–XII PCM STUDENTS
            </div>
            <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--text)]">
              {roleModel.inspireWhy}
            </p>
          </div>
        ) : null}

        {roleModel.pcmConnections ? (
          <div className="mt-3">
            <div className="font-mono text-[10px] tracking-[0.12em] text-teal">
              PCM CONNECTIONS
            </div>
            <p className="mt-1 text-[12px] leading-snug text-[var(--text-dim)]">
              {roleModel.pcmConnections}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
