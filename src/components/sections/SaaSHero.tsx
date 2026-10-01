"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Search,
  Flame,
  Check
} from "lucide-react";
import { allOpportunities } from "@/config/site";
import { useLanguage } from "@/lib/i18n/context";

export function SaaSHero() {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const autocompleteMatches = query.trim().length > 1
    ? allOpportunities
        .filter((o) =>
          o.title.toLowerCase().includes(query.toLowerCase()) ||
          o.organizer.toLowerCase().includes(query.toLowerCase()) ||
          o.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/opportunities?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/opportunities");
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-grid-subtle border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading & Autocomplete Search */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              {t.hero.titlePart1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-500">
                {t.hero.titleGradient}
              </span>{" "}
              {t.hero.titlePart2}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto md:mx-0 leading-relaxed font-normal">
              {t.hero.description}
            </p>

            {/* Quick Search with Autocomplete */}
            <div className="relative max-w-lg mx-auto md:mx-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder={t.hero.searchPlaceholder}
                  className="w-full pl-11 pr-28 py-3.5 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Найти
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {focused && autocompleteMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-xl z-30 space-y-1">
                  {autocompleteMatches.map((opp) => (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{opp.flag}</span>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{opp.title}</div>
                          <div className="text-[10px] text-zinc-500">{opp.organizer}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {opp.daysLeft} дн.
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center md:justify-start">
              <Link
                href="/opportunities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/essay-checker"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>{t.hero.ctaSecondary}</span>
              </Link>
            </div>

            {/* Real Product Metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-200 dark:border-zinc-800/80 text-left">
              {[
                { value: `${allOpportunities.length}+`, label: t.hero.statsPrograms },
                { value: "8", label: t.hero.statsCategories },
                { value: "98%", label: t.hero.statsAccuracy },
                { value: "25+", label: t.hero.statsRegions },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Tracker Preview */}
          <div className="lg:col-span-5">
            <div className="zinc-card rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-xl space-y-4">
              {/* Card Header: Simulated Profile */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">Ameli S.</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        10 класс • Алматы
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Цель: Nazarbayev University & STEM
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  98% Match
                </span>
              </div>

              {/* Feed items with Deadline Counter */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>Мой активный трекер</span>
                  <span className="text-blue-600 dark:text-blue-400 text-[11px] font-bold">3 программы</span>
                </div>

                {/* Program 1 */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇰🇿</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">NU Pre-College Summer Research</div>
                      <div className="text-[10px] text-zinc-500">Летняя школа • Назарбаев Университет</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      42 дня
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">до дедлайна</div>
                  </div>
                </div>

                {/* Program 2 */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇰🇿</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Республиканская олимпиада «Дарын»</div>
                      <div className="text-[10px] text-zinc-500">Олимпиада • РНПЦ «Дарын»</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      22 дня
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">районный тур</div>
                  </div>
                </div>

                {/* Program 3 */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Wharton Investment Competition</div>
                      <div className="text-[10px] text-zinc-500">Бизнес-турнир • UPenn Wharton</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      14 дней
                    </div>
                    <div className="text-[10px] text-rose-500 mt-0.5">сбор команды</div>
                  </div>
                </div>
              </div>

              {/* Match insight */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI анализ шансов:</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                  «Профиль полностью подходит для подачи на грант NU: отличный уровень языка (B2) и фокус на исследованиях.»
                </p>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-2.5 rounded-xl bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Перейти в личный кабинет</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
