"use client";

import { useState, useMemo } from "react";
import { siteConfig, allOpportunities } from "@/config/site";
import { Opportunity, OpportunityScope } from "@/types";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { ProfileMatchModal } from "@/components/ai/ProfileMatchModal";
import { useLanguage } from "@/lib/i18n/context";
import { 
  Search, 
  X,
  Compass,
  ArrowUpDown,
  Clock,
  Sparkles
} from "lucide-react";

export function OpportunitiesCatalog({
  initialScope = "all"
}: {
  initialScope?: OpportunityScope | "all";
}) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<OpportunityScope | "all">(initialScope);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<number | "all">("all");
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "deadline" | "newest">("popular");
  const [selectedModalOpp, setSelectedModalOpp] = useState<Opportunity | null>(null);

  const scopes = [
    { id: "all", label: t.filters.allScopes },
    { id: "kazakhstan", label: t.filters.kazakhstanScope },
    { id: "international", label: t.filters.internationalScope },
  ];

  const categories = [
    { id: "all", label: t.filters.allCategories },
    { id: "olympiad", label: t.filters.olympiads },
    { id: "hackathon", label: t.filters.hackathons },
    { id: "summer_school", label: t.filters.summerSchools },
    { id: "scholarship", label: t.filters.grants },
    { id: "internship", label: t.filters.internships },
    { id: "mun", label: t.filters.mun },
    { id: "university", label: t.filters.universities },
  ];

  const grades = ["all", 7, 8, 9, 10, 11, 12] as const;

  const filteredOpportunities = useMemo(() => {
    const list = allOpportunities.filter((item) => {
      // Scope filter
      if (selectedScope !== "all" && item.scope !== selectedScope) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== "all") {
        if (item.gradeMin > selectedGrade || item.gradeMax < selectedGrade) {
          return false;
        }
      }

      // Deadline urgency filter
      if (selectedDeadlineFilter === "urgent" && item.daysLeft > 14) {
        return false;
      }
      if (selectedDeadlineFilter === "month" && item.daysLeft > 31) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOrg = item.organizer.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchCity = item.cityBadge.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc && !matchTags && !matchCity) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "popular") {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === "deadline") {
        return a.daysLeft - b.daysLeft;
      }
      return 0;
    });
  }, [searchQuery, selectedScope, selectedCategory, selectedGrade, selectedDeadlineFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedScope("all");
    setSelectedCategory("all");
    setSelectedGrade("all");
    setSelectedDeadlineFilter("all");
    setSortBy("popular");
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Distinct Opportunities Catalog Studio Header */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25">
            Каталог возможностей • 104 проверенные программы
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Сезон 2026 активен
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Все возможности для школьников и студентов
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Единый каталог проверенных олимпиад, программ с полным грантом, престижных летних школ и IT-стажировок в Казахстане 🇰🇿 и мире 🌍.
            </p>
          </div>

          {/* Quick Scope Quick Switch */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
            {scopes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScope(s.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedScope === s.id
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Highlights Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15">
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>🇰🇿</span> 52 программы РК
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">NU, Дарын, Astana Hub</div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15">
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>🌍</span> 52 программы мира
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Wharton, Harvard, FLEX</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>🎓</span> 100% гранты
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Бесплатное обучение</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15">
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>🤖</span> AI Скоринг
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Оценка шансов поступления</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="zinc-card p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 mb-8 space-y-4 shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.hero.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white font-semibold border border-zinc-700"
                  : "bg-white/60 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Grade selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">{t.filters.gradeLabel}:</span>
              <div className="flex items-center gap-1">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      selectedGrade === g
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {g === "all" ? t.filters.allGrades : `${g} кл.`}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline urgency selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">{t.filters.deadlineLabel}:</span>
              <select
                value={selectedDeadlineFilter}
                onChange={(e) => setSelectedDeadlineFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">{t.filters.allDeadlines}</option>
                <option value="urgent">{t.filters.urgentDeadline}</option>
                <option value="month">{t.filters.monthDeadline}</option>
              </select>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">{t.filters.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="popular">{t.filters.sortPopular}</option>
                <option value="deadline">{t.filters.sortDeadline}</option>
                <option value="newest">{t.filters.sortNewest}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">
              {t.filters.foundCount}: <strong className="text-zinc-900 dark:text-zinc-200">{filteredOpportunities.length}</strong>
            </span>
            {(searchQuery || selectedScope !== "all" || selectedCategory !== "all" || selectedGrade !== "all" || selectedDeadlineFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {t.filters.resetFilters}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-16 zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Compass className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">{t.filters.noResultsTitle}</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {t.filters.noResultsDesc}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
          >
            {t.filters.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              initialIsTracked={false}
              onOpenAiModal={(opp) => setSelectedModalOpp(opp)}
            />
          ))}
        </div>
      )}

      {/* AI Profile Match Modal */}
      <ProfileMatchModal
        opportunity={selectedModalOpp}
        isOpen={!!selectedModalOpp}
        onClose={() => setSelectedModalOpp(null)}
      />
    </div>
  );
}
