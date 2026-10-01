"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import { toggleTrackOpportunity, updateApplicationStatus, ApplicationStatus } from "@/actions/opportunities";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import { 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  Calendar,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  initialIsTracked?: boolean;
  initialStatus?: ApplicationStatus;
  onOpenAiModal?: (opp: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  initialIsTracked = false,
  initialStatus = "interested",
  onOpenAiModal,
}: OpportunityCardProps) {
  const { t, language } = useLanguage();
  const [isTracked, setIsTracked] = useState(initialIsTracked);
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  // Optimistic toggle
  const handleToggleTrack = () => {
    const nextTracked = !isTracked;

    // Optimistic UI update immediately
    setIsTracked(nextTracked);

    if (nextTracked) {
      toast.success(t.card.inTracker, {
        description: `${opportunity.title} добавлен в ваш Deadline Tracker`,
      });
    } else {
      toast.info("Удалено из трекера", {
        description: `${opportunity.title} убран из списка отслеживания`,
      });
    }

    startTransition(async () => {
      try {
        const res = await toggleTrackOpportunity(opportunity.id, status);
        if (res.success) {
          if (res.action === "removed") {
            setIsTracked(false);
          } else if (res.action === "added") {
            setIsTracked(true);
          }
        }
      } catch {
        // Revert on error
        setIsTracked(!nextTracked);
        toast.error("Не удалось синхронизировать с сервером");
      }
    });
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus);
    toast.success("Статус обновлен", {
      description: `Статус изменен на "${getStatusLabel(newStatus)}"`,
    });
    startTransition(async () => {
      await updateApplicationStatus(opportunity.id, newStatus);
    });
  };

  const getStatusLabel = (s: ApplicationStatus) => {
    switch (s) {
      case "interested":
      case "saved":
        return t.card.statusInterested;
      case "preparing":
      case "in_progress":
        return t.card.statusPreparing;
      case "applied":
      case "submitted":
        return t.card.statusApplied;
      case "result_received":
      case "accepted":
        return t.card.statusAccepted;
      case "rejected":
        return t.card.statusRejected;
      default:
        return t.card.statusInterested;
    }
  };

  // Localized title & description if present
  const displayTitle = typeof opportunity.title === "object"
    ? (opportunity.title as any)[language] || (opportunity.title as any).ru || (opportunity.title as any).en
    : opportunity.title;

  const displayDesc = typeof opportunity.description === "object"
    ? (opportunity.description as any)[language] || (opportunity.description as any).ru || (opportunity.description as any).en
    : opportunity.description;

  return (
    <div className="zinc-card zinc-card-hover p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-4 group transition-all">
      <div className="space-y-3">
        {/* Top Header: Flag, Category, City badge, and Bookmark Tracker Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {opportunity.flag}
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  {opportunity.categoryLabel}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/80">
                  {opportunity.cityBadge}
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-medium block mt-0.5">
                {opportunity.organizer}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("[Дедлайн] " + opportunity.title)}&dates=${new Date(Date.now() + opportunity.daysLeft * 24 * 3600 * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${new Date(Date.now() + (opportunity.daysLeft * 24 + 1) * 3600 * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}&details=${encodeURIComponent("Дедлайн: " + opportunity.title + "\\nОрганизатор: " + opportunity.organizer + "\\nПодать заявку: " + opportunity.link)}&location=${encodeURIComponent(opportunity.organizer)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 hover:border-blue-500/40 transition-all cursor-pointer"
              title="Добавить дедлайн в Google Календарь"
            >
              <Calendar className="w-4 h-4" />
            </a>

            {/* Optimistic Bookmark Button */}
            <button
              onClick={handleToggleTrack}
              disabled={isPending}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isTracked
                  ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400"
                  : "bg-zinc-100 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
              title={isTracked ? "В вашем трекере (нажмите для удаления)" : t.card.addToTracker}
            >
              {isTracked ? (
                <BookmarkCheck className="w-4 h-4 fill-blue-500 text-blue-600 dark:text-blue-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          <Link href={`/opportunities/${opportunity.id}`}>
            {displayTitle}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* Card Footer: Grades, Deadline, Status Selector (if tracked), and AI Evaluation */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            {t.filters.gradeLabel}: {opportunity.gradeMin}–{opportunity.gradeMax}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
            opportunity.daysLeft <= 10
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 font-bold animate-pulse"
              : opportunity.daysLeft <= 20
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-semibold"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
          }`}>
            <Clock className="w-3 h-3" />
            {opportunity.daysLeft} {t.card.daysLeft}
          </span>
        </div>

        {/* If Tracked: Show Status Dropdown */}
        {isTracked ? (
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-blue-500/25 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              {t.card.statusLabel}
            </span>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg px-2.5 py-1 pr-6 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
              >
                <option value="interested">{t.card.statusInterested}</option>
                <option value="preparing">{t.card.statusPreparing}</option>
                <option value="applied">{t.card.statusApplied}</option>
                <option value="result_received">{t.card.statusAccepted}</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          /* Button to trigger tracking */
          <button
            onClick={handleToggleTrack}
            className="w-full py-1.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{t.card.addToTracker}</span>
          </button>
        )}

        {/* AI Chances Quick Audit Button */}
        {onOpenAiModal && (
          <button
            onClick={() => onOpenAiModal(opportunity)}
            className="w-full py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.card.aiAuditBtn}</span>
          </button>
        )}

        {/* Bottom Details link */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-500">
            {t.card.deadlineUntil} {opportunity.deadlineDate}
          </span>

          <Link
            href={`/opportunities/${opportunity.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>{t.card.detailsBtn}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
