"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { allOpportunities } from "@/config/site";
import { Opportunity, OpportunityScope } from "@/types";
import { UserAvatar } from "@/components/ui/Avatar";
import { ProfileMatchModal } from "@/components/ai/ProfileMatchModal";
import { useLanguage } from "@/lib/i18n/context";
import { 
  updateApplicationStatus, 
  toggleTrackOpportunity, 
  ApplicationStatus, 
  TrackedOpportunityItem 
} from "@/actions/opportunities";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { toast } from "sonner";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  FileEdit, 
  FileText, 
  Map, 
  Flame, 
  Layers,
  ChevronRight,
  TrendingUp,
  Columns3,
  ListFilter,
  UserCheck,
  FileCheck2,
  Search,
  X,
  Target,
  Award,
  Zap,
  Tag
} from "lucide-react";

interface SavedItemState {
  opportunityId: string;
  status: ApplicationStatus;
  notes?: string;
  updatedAt?: string;
}

interface DashboardTrackerProps {
  user: {
    id?: string;
    fullName?: string;
    grade?: string;
    city?: string;
    bio?: string;
    interests?: string[];
    email?: string;
    avatarUrl?: string;
    resumeUrl?: string;
    resumeName?: string;
    resumeSize?: string;
    isDemo?: boolean;
  } | null;
}

export function DashboardTracker({ user }: DashboardTrackerProps) {
  const { t, language } = useLanguage();

  // Tracked items initial state
  const [items, setItems] = useState<SavedItemState[]>([
    { 
      opportunityId: "nu-summer-research", 
      status: "preparing", 
      notes: "Запросить транскрипт в школе и подготовить черновик эссе" 
    },
    { 
      opportunityId: "daryn-republican", 
      status: "preparing", 
      notes: "Школьный этап пройден, готовиться к району" 
    },
    { 
      opportunityId: "wharton-investment-comp", 
      status: "interested", 
      notes: "Собрать команду из 4 человек" 
    },
    { 
      opportunityId: "flex-scholarship", 
      status: "applied", 
      notes: "Анкета и 3 эссе отправлены!" 
    },
  ]);

  // User's custom interests tags
  const [customInterests, setCustomInterests] = useState<string[]>(
    user?.interests && user.interests.length > 0
      ? user.interests
      : ["Олимпиадная математика", "Machine Learning & AI", "FinTech & Инвестиции", "FLEX & Гранты"]
  );
  const [newInterestInput, setNewInterestInput] = useState("");
  const [showAddInterestInput, setShowAddInterestInput] = useState(false);

  // Active interest filter
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [scopeFilter, setScopeFilter] = useState<OpportunityScope | "all">("all");
  const [selectedModalOpp, setSelectedModalOpp] = useState<Opportunity | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle adding custom interest tag on the fly
  const handleAddInterest = () => {
    const trimmed = newInterestInput.trim();
    if (!trimmed) return;
    if (!customInterests.includes(trimmed)) {
      const updated = [...customInterests, trimmed];
      setCustomInterests(updated);
      toast.success(`Интерес «${trimmed}» добавлен в ваш профиль!`);
    }
    setNewInterestInput("");
    setShowAddInterestInput(false);
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setCustomInterests((prev) => prev.filter((i) => i !== interestToRemove));
    if (selectedInterestFilter === interestToRemove) {
      setSelectedInterestFilter(null);
    }
    toast.info(`Интерес удален`);
  };

  // Status mapping
  const normalizeStatus = (status: ApplicationStatus): ApplicationStatus => {
    if (status === "saved") return "interested";
    if (status === "in_progress") return "preparing";
    if (status === "submitted") return "applied";
    if (status === "accepted" || status === "rejected") return "result_received";
    return status;
  };

  const handleUpdateStatus = (oppId: string, newStatus: ApplicationStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.opportunityId === oppId ? { ...item, status: newStatus } : item))
    );
    toast.success("Статус обновлен в трекере");
    startTransition(async () => {
      await updateApplicationStatus(oppId, newStatus);
    });
  };

  const handleRemoveItem = (oppId: string) => {
    const opp = allOpportunities.find((o) => o.id === oppId);
    setItems((prev) => prev.filter((item) => item.opportunityId !== oppId));
    toast.info("Удалено из трекера", {
      description: `${opp?.title || oppId} убран из вашего трекера`,
    });
    startTransition(async () => {
      await toggleTrackOpportunity(oppId);
    });
  };

  const handleAddOpportunityToTracker = (opp: Opportunity) => {
    if (items.some((i) => i.opportunityId === opp.id)) {
      toast.info("Программа уже добавлена в трекер");
      return;
    }
    setItems((prev) => [...prev, { opportunityId: opp.id, status: "interested" }]);
    toast.success(`${opp.title} добавлен в трекер!`);
    startTransition(async () => {
      await toggleTrackOpportunity(opp.id);
    });
  };

  // Tracked items mapped with opportunity details
  const trackedItemsWithOpp = useMemo(() => {
    return items
      .map((item) => {
        const opp = allOpportunities.find((o) => o.id === item.opportunityId);
        return { ...item, opp };
      })
      .filter((item): item is SavedItemState & { opp: Opportunity } => {
        if (!item.opp) return false;
        if (scopeFilter !== "all" && item.opp.scope !== scopeFilter) return false;
        if (selectedInterestFilter) {
          const matchTag = item.opp.tags.some((t) =>
            t.toLowerCase().includes(selectedInterestFilter.toLowerCase())
          );
          if (!matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => a.opp.daysLeft - b.opp.daysLeft);
  }, [items, scopeFilter, selectedInterestFilter]);

  const kanbanItems: TrackedOpportunityItem[] = useMemo(() => {
    return trackedItemsWithOpp.map(({ opportunityId, status, notes, opp }) => ({
      id: `track-${opp.id}`,
      opportunityId: opp.id,
      status,
      isFavorite: true,
      personalNotes: notes,
      deadlineReminder: true,
      updatedAt: new Date().toISOString(),
      opportunity: opp,
    }));
  }, [trackedItemsWithOpp]);

  // AI Recommendations tailored strictly to user's custom interests
  const aiRecommendedOpps = useMemo(() => {
    const trackedIds = new Set(items.map((i) => i.opportunityId));
    const userInterestSet = new Set(customInterests.map((i) => i.toLowerCase()));

    return allOpportunities
      .filter((o) => !trackedIds.has(o.id))
      .map((opp) => {
        const matchesInterest = opp.tags.filter((t) =>
          userInterestSet.has(t.toLowerCase()) ||
          customInterests.some((ci) => ci.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ci.toLowerCase()))
        ).length;
        const relevance = Math.min(98, 65 + matchesInterest * 15);
        return { opp, relevance };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4);
  }, [items, customInterests]);

  const appliedCount = items.filter((i) => normalizeStatus(i.status) === "applied").length;
  const preparingCount = items.filter((i) => normalizeStatus(i.status) === "preparing").length;
  const closestOpp = trackedItemsWithOpp[0]?.opp ?? null;
  const closestDeadline = closestOpp?.daysLeft ?? null;

  // Filtered catalog in quick-add modal
  const filteredCatalogForModal = useMemo(() => {
    const trackedIds = new Set(items.map((i) => i.opportunityId));
    if (!catalogSearchQuery.trim()) {
      return allOpportunities.filter((o) => !trackedIds.has(o.id)).slice(0, 8);
    }
    const q = catalogSearchQuery.toLowerCase();
    return allOpportunities
      .filter((o) => !trackedIds.has(o.id))
      .filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organizer.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [items, catalogSearchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. STREAMLINED EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 z-10">
          {/* User profile & readiness info */}
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user?.avatarUrl}
              fallbackName={user?.fullName || "Жанибек Абубакиров"}
              size="lg"
              showStatus={true}
              isOnline={true}
              className="border border-zinc-200 dark:border-zinc-700 ring-2 ring-white dark:ring-zinc-900 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {user?.fullName || "Жанибек Абубакиров"}
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  {user?.grade || "10 класс"}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {user?.city ? `г. ${user.city} 🇰🇿` : "г. Алматы 🇰🇿"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {user?.resumeName ? (
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                    title="Резюме прикреплено к профилю"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>CV: {user.resumeName}</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Загрузить резюме (CV)</span>
                  </Link>
                )}
                <span>•</span>
                <Link
                  href="/profile"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <FileEdit className="w-3 h-3" />
                  <span>Настройки профиля</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Admission Readiness Gauge & Fast Action */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Circular Readiness Score */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="stroke-blue-600 dark:stroke-blue-400"
                    strokeWidth="3.5"
                    strokeDasharray="113.1"
                    strokeDashoffset="13.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-zinc-900 dark:text-white font-mono">
                  88%
                </span>
              </div>
              <div className="space-y-0.5 hidden sm:block">
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">
                  Готовность к гранту
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>Высокий потенциал</span>
                </div>
              </div>
            </div>

            {/* Fast Action Buttons */}
            <button
              onClick={() => setShowCatalogModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.01]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Добавить программу</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED LIGHTWEIGHT INTERESTS ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mr-1">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.dashboard.myInterests}:</span>
          </span>

          {customInterests.map((interest) => {
            const isActive = selectedInterestFilter === interest;
            return (
              <div
                key={interest}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-blue-500/40"
                }`}
              >
                <button
                  onClick={() =>
                    setSelectedInterestFilter(isActive ? null : interest)
                  }
                  className="cursor-pointer"
                  title="Кликните для фильтрации трекера по этому интересу"
                >
                  {interest}
                </button>
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                  title="Удалить интерес"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add interest tag button */}
          {showAddInterestInput ? (
            <div className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                placeholder="Новый интерес..."
                autoFocus
                className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-blue-500 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none w-36 shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setShowAddInterestInput(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddInterestInput(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Свой интерес</span>
            </button>
          )}
        </div>

        {selectedInterestFilter && (
          <button
            onClick={() => setSelectedInterestFilter(null)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
          >
            Сбросить фильтр по интересу (показаны все)
          </button>
        )}
      </div>

      {/* 3. METRIC CARDS WITH FLUID STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="zinc-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">{t.dashboard.totalTracked}</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
              {items.length}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {preparingCount} в активной подготовке
            </div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: "75%" }} />
          </div>
        </div>

        {/* Metric 2: Closest Deadline */}
        <div className="zinc-card p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold">{t.dashboard.closestDeadline}</span>
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {closestDeadline !== null ? `${closestDeadline} дн.` : "—"}
            </div>
            <div className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium truncate mt-1">
              {closestOpp?.title || "Все дедлайны соблюдены"}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500">
            {closestOpp ? `Дедлайн: ${closestOpp.deadlineDate}` : "Спокойный режим"}
          </div>
        </div>

        {/* Metric 3: Submitted */}
        <div className="zinc-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold">{t.dashboard.submittedCount}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {appliedCount}
            </div>
            <div className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium mt-1">
              Успешно отправлено
            </div>
          </div>
          <div className="text-[10px] text-zinc-500">
            FLEX Program (анкета + 3 эссе)
          </div>
        </div>

        {/* Metric 4: AI Match Index */}
        <div className="zinc-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">AI Match Точность</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
              96%
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              По 4 олимпиадным интересам
            </div>
          </div>
          <div className="text-[10px] text-zinc-500">
            Рекомендации обновлены
          </div>
        </div>
      </div>

      {/* 4. AI SUPERPOWERS 4-GRID HUB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
              AI Инструменты Wintality
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Powered by Wintality AI Core
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: AI Mock Interview */}
          <Link
            href="/dashboard/mock-interview"
            className="group zinc-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                AI Тренажер интервью
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Симуляция вступительного собеседования в NU, FLEX и летние школы с разбором слабых мест.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span>Пройти интервью</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tool 2: Essay Reviewer */}
          <Link
            href="/dashboard/essay-checker"
            className="group zinc-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                AI Аудит эссе & Motivation
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Мгновенная проверка мотивационного письма по критериям грантов и рерайт слабых формулировок.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              <span>Проверить текст</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tool 3: Harvard Resume Builder */}
          <Link
            href="/dashboard/resume"
            className="group zinc-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Генератор Harvard CV
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Создание академического резюме по мировым стандартам Ivy League с экспортом в готовый PDF.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Собрать резюме</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tool 4: Academic Roadmap */}
          <Link
            href="/dashboard/roadmap"
            className="group zinc-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Map className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                AI Роадмап поступления
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Помесячный план участия в олимпиадах («Дарын», IZhO) и ключевых дедлайнах до 11 класса.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span>Открыть план</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. WORKSPACE CONTROLS: VIEW MODE & REGION FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "kanban"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>{t.dashboard.kanbanBoard}</span>
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{t.dashboard.deadlineList}</span>
          </button>
        </div>

        {/* Scope Filter */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: t.dashboard.allRegions },
            { id: "kazakhstan", label: t.dashboard.kazakhstanRegion },
            { id: "international", label: t.dashboard.worldRegion },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setScopeFilter(s.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scopeFilter === s.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. TRACKER MAIN WORKSPACE: KANBAN OR LIST */}
      {viewMode === "kanban" ? (
        <KanbanBoard initialItems={kanbanItems} />
      ) : (
        /* List View */
        <div className="space-y-3">
          {trackedItemsWithOpp.map(({ opportunityId, status, notes, opp }) => (
            <div
              key={opportunityId}
              className="zinc-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{opp.flag}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {opp.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {opp.cityBadge}
                    </span>
                    <span className="text-xs text-zinc-500">{opp.organizer}</span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="hover:text-blue-500 transition-colors"
                    >
                      {opp.title}
                    </Link>
                  </h3>

                  {notes && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 inline-flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                      opp.daysLeft <= 14
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{opp.daysLeft} дн. до дедлайна</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={normalizeStatus(status)}
                      onChange={(e) =>
                        handleUpdateStatus(opportunityId, e.target.value as ApplicationStatus)
                      }
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                    >
                      <option value="interested">{t.card.statusInterested}</option>
                      <option value="preparing">{t.card.statusPreparing}</option>
                      <option value="applied">{t.card.statusApplied}</option>
                      <option value="result_received">{t.card.statusAccepted}</option>
                    </select>

                    <button
                      onClick={() => handleRemoveItem(opportunityId)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Удалить из трекера"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500">
                  Дедлайн: <strong className="text-zinc-900 dark:text-zinc-100">{opp.deadlineDate}</strong>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedModalOpp(opp)}
                    className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Анализ шансов</span>
                  </button>

                  <a
                    href={opp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    <span>{t.dashboard.officialApply}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. AI TAILORED RECOMMENDATIONS SECTION */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>{t.dashboard.aiRecommendations}</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Подобрано специально под ваши интересы ({customInterests.slice(0, 3).join(", ")})
            </p>
          </div>
          <Link
            href="/opportunities"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Вся база 104+ программ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiRecommendedOpps.map(({ opp, relevance }) => (
            <div
              key={opp.id}
              className="zinc-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-zinc-400">{opp.organizer}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-500/10">
                    {relevance}% match
                  </span>
                </div>

                <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {opp.title}
                </h3>

                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-400">
                  {opp.daysLeft} дн. до конца
                </span>
                <button
                  type="button"
                  onClick={() => handleAddOpportunityToTracker(opp)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors cursor-pointer"
                >
                  + В трекер
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ADD OPPORTUNITY MODAL (Search through 104 verified opportunities) */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Добавить программу в личный трекер</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Поиск по 104 проверенным олимпиадам, грантам и стажировкам Казахстана и мира
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder="Поиск по названию, организатору или тегу (например: NU, Дарын, Wharton, FLEX)..."
                autoFocus
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {filteredCatalogForModal.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  Ничего не найдено по запросу.
                </div>
              ) : (
                filteredCatalogForModal.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{opp.flag}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{opp.organizer}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {opp.categoryLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {opp.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{opp.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                        {opp.daysLeft} дн.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddOpportunityToTracker(opp);
                          setShowCatalogModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Добавить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
              <span>Или перейдите в полный каталог с фильтрами</span>
              <Link
                href="/opportunities"
                onClick={() => setShowCatalogModal(false)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Открыть каталог →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI PROFILE MATCH MODAL */}
      <ProfileMatchModal
        opportunity={selectedModalOpp}
        isOpen={!!selectedModalOpp}
        onClose={() => setSelectedModalOpp(null)}
        user={user}
      />
    </div>
  );
}
