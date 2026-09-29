"use client";

import { useState } from "react";
import Link from "next/link";
import { allOpportunities } from "@/config/site";
import { OpportunityScope } from "@/types";
import { useLanguage } from "@/lib/i18n/context";
import { Clock, ArrowRight, Flame } from "lucide-react";

export function FeaturedOpportunities() {
  const { t, language } = useLanguage();
  const [selectedScope, setSelectedScope] = useState<OpportunityScope | "all">("all");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const categories = [
    { id: "all", label: t.filters.allCategories },
    { id: "summer_school", label: t.filters.summerSchools },
    { id: "olympiad", label: t.filters.olympiads },
    { id: "mun", label: t.filters.mun },
    { id: "scholarship", label: t.filters.grants },
    { id: "internship", label: t.filters.internships }
  ];

  const filtered = allOpportunities.filter((item) => {
    if (selectedScope !== "all" && item.scope !== selectedScope) return false;
    if (selectedCat !== "all" && item.category !== selectedCat) return false;
    return true;
  });

  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-2">
              Казахстанские возможности & Мировой уровень
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Популярные программы сезона
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
              Программы с подтвержденным статусом, открытым приемом заявок и прямыми путями поступления на грант.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
          >
            <span>Смотреть все 500+ программ в каталоге</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scope Selector: Все / Казахстан 🇰🇿 / Мир 🌍 */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: "all", label: "Все возможности" },
            { id: "kazakhstan", label: "Казахстан 🇰🇿 (NU, Дарын, Tech Orda)" },
            { id: "international", label: "Международные 🌍 (Harvard, FLEX, Wharton)" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScope(s.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedScope === s.id
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCat === cat.id
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white font-semibold border border-zinc-700"
                  : "bg-white/80 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((item) => {
            const displayTitle = typeof item.title === "object"
              ? (item.title as any)[language] || (item.title as any).ru || (item.title as any).en
              : item.title;

            return (
              <div
                key={item.id}
                className="zinc-card zinc-card-hover p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-4 group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        {item.flag}
                      </span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 block font-semibold">
                          {item.categoryLabel}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          {item.organizer}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
                      item.daysLeft <= 10
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {item.daysLeft} дн.
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    <Link href={`/opportunities/${item.id}`}>
                      {displayTitle}
                    </Link>
                  </h3>

                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{item.matchScore ? item.matchScore * 3 : 140} школьников следят</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-zinc-500">
                      До {item.deadlineDate}
                    </span>

                    <Link
                      href={`/opportunities/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
