"use client";

import Link from "next/link";
import { 
  Calendar, 
  FileText, 
  Map, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Clock,
  Layers,
  GraduationCap
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
            Bento Features • Wintality AI Core
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Инструменты для твоей академической победы
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Все необходимые сервисы для системной подготовки к олимпиадам, грантам и поступлению в ведущие университеты.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento 1: AI Deadline Tracker (Span 7) */}
          <div className="md:col-span-7 zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  Deadline Tracker
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                Интерактивный Канбан-трекер дедлайнов
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Отслеживайте статус подготовки («Интересно» → «Готовлю документы» → «Подано»). Наглядный таймер с напоминаниями о горящих сроках не позволит пропустить ни одной важной даты.
              </p>
            </div>

            {/* Simulated Mini Kanban View inside Bento */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Интересно (2)</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">Wharton Invest</div>
                <div className="text-[10px] text-amber-500 font-mono">14 дней</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-amber-500/30 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono text-amber-500 uppercase">В подготовке (1)</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">Дарын олимпиада</div>
                <div className="text-[10px] text-rose-500 font-mono font-bold animate-pulse">22 дня</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-purple-500/30 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono text-purple-500 uppercase">Подано (1)</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">FLEX Program</div>
                <div className="text-[10px] text-emerald-500 font-mono">Заявка ✓</div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Открыть личный трекер дедлайнов</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento 2: AI Essay Reviewer (Span 5) */}
          <div className="md:col-span-5 zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                  Wintality Neural AI
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                AI Рецензент мотивационных эссе
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Глубокий аудит мотивационных писем под критерии отбора Назарбаев Университета, FLEX или Гарварда. Находит слабые места и дает готовые варианты усиления фраз.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Оценка убедительности</span>
                <span className="font-mono text-emerald-500 font-bold">8.5 / 10</span>
              </div>
              <p className="text-[11px] text-zinc-500 italic">
                «Сильная мотивация. Добавьте больше измеримых результатов участия в олимпиадах.»
              </p>
            </div>

            <Link
              href="/dashboard/essay-checker"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Проверить черновик эссе</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento 3: AI Personal Academic Roadmap (Span 5) */}
          <div className="md:col-span-5 zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Map className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                  Roadmap AI
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Персональная дорожная карта года
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Пошаговый план по месяцам: когда регистрироваться на олимпиады («Дарын», IZhO), когда сдавать IELTS и как успеть подать в летние школы.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
              <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                Траектория 10 класса • STEM / NU
              </div>
              <div className="text-[10px] text-zinc-500">
                4 ключевых квартала • 12 конкретных действий
              </div>
            </div>

            <Link
              href="/dashboard/roadmap"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Построить свой роадмап</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento 4: Kazakhstan & Global Catalog Aggregator (Span 7) */}
          <div className="md:col-span-7 zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  База 500+ программ
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                Агрегатор возможностей Казахстана и мира
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Каждая программа проверена вручную: требования к классам, языку, дедлайны и ссылки на официальную подачу. Никаких битых ссылок и фейковых объявлений.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {["🇰🇿 Nazarbayev University", "🇰🇿 РНПЦ «Дарын»", "🇰🇿 IZhO РФМШ", "🇰🇿 Tech Orda", "🇺🇸 Harvard SSP", "🇺🇸 FLEX Program", "🏆 Wharton"].map((item) => (
                <span
                  key={item}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>

            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Перейти в полный каталог</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
