"use client";

import { useState, useEffect, useTransition } from "react";
import { Opportunity } from "@/types";
import { ProfileMatchModal } from "@/components/ai/ProfileMatchModal";
import { toggleTrackOpportunity, incrementOpportunityView } from "@/actions/opportunities";
import { toast } from "sonner";
import { ExternalLink, Bookmark, Sparkles, BookmarkCheck } from "lucide-react";

export function OpportunityDetailActions({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Increment view on mount
  useEffect(() => {
    incrementOpportunityView(opportunity.id);
  }, [opportunity.id]);

  const handleToggle = () => {
    const next = !isSaved;
    setIsSaved(next);
    if (next) {
      toast.success("Добавлено в трекер", {
        description: `${opportunity.title} сохранен в вашем Deadline Tracker`
      });
    } else {
      toast.info("Удалено из трекера");
    }

    startTransition(async () => {
      await toggleTrackOpportunity(opportunity.id);
    });
  };

  return (
    <>
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-3">
        <a
          href={opportunity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Подать заявку на официальном сайте</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-blue-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Оценить шансы с AI</span>
        </button>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            isSaved
              ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
              : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
          }`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-3.5 h-3.5 fill-blue-500 text-blue-600 dark:text-blue-400" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          )}
          <span>{isSaved ? "В трекере ✓" : "Добавить в Deadline Tracker"}</span>
        </button>
      </div>

      <ProfileMatchModal
        opportunity={opportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
