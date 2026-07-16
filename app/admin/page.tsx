"use client";

import { useState } from "react";
import { QuestionsAdminPanel } from "@/components/admin/questions-admin-panel";
import { SchedulePreviewPanel } from "@/components/admin/schedule-preview-panel";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dailydose", label: "DailyDose" },
  { id: "funbrain", label: "FunBrain" },
  { id: "pledges", label: "AI Pledges" },
  { id: "puzzles", label: "Puzzles" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("dailydose");

  return (
    <div>
      <nav className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "font-display font-bold text-sm px-4 py-2 rounded-full border transition-colors",
              tab === t.id
                ? "border-teal bg-teal/15 text-teal"
                : "border-[var(--line)] text-[var(--text-dim)] hover:border-teal/40",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "dailydose" && (
        <QuestionsAdminPanel
          domain="dailydose"
          title="DailyDose MCQs"
          showTag
        />
      )}
      {tab === "funbrain" && (
        <QuestionsAdminPanel
          domain="funbrain"
          title="FunBrain MCQs"
          showTag={false}
        />
      )}
      {tab === "pledges" && <SchedulePreviewPanel mode="pledges" />}
      {tab === "puzzles" && <SchedulePreviewPanel mode="puzzles" />}
    </div>
  );
}
