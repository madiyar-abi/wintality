"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Award, 
  ArrowRight,
  Bookmark
} from "lucide-react";
import { RoadmapResult, RoadmapMilestone } from "@/lib/ai/gemini";
import { toast } from "sonner";

export default function AcademicRoadmapPage() {
  const [targetGoal, setTargetGoal] = useState("Поступление в Nazarbayev University (NU) на Computer Science");
  const [grade, setGrade] = useState("10 класс");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResult | null>(null);

  const goalPresets = [
    "Поступление в Nazarbayev University (NU) на Computer Science",
    "Победа в Республиканской олимпиаде («Дарын») по информатике/математике",
    "Поступление в университеты Лиги Плюща (Ivy League) на полную стипендию",
    "Запуск мобильного стартапа через nFactorial / Astana Hub",
    "Подготовка к бакалавриату в КБТУ / AITU с ректорским грантом"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGoal,
          grade,
          interests: ["Computer Science", "Business & Economics", "Олимпиады РК"]
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data = (await res.json()) as RoadmapResult;
      setResult(data);
      toast.success("Роадмап успешно сгенерирован!");
    } catch {
      // Fallback
      setResult({
        goalTitle: targetGoal,
        strategySummary: `Сбалансированная траектория для ${grade}: синхронизация участия в олимпиадах Казахстана (Дарын, Жаутыковская) с подготовкой портфолио в NU и международные программы.`,
        milestones: [
          {
            month: "Октябрь – Ноябрь",
            title: "Формирование академической базы и отборочные туры",
            priority: "high",
            tasks: [
              "Участие в школьном и районном этапе Республиканской олимпиады",
              "Диагностический тест IELTS (цель: 6.5+)",
              "Сбор списка из 5 целевых программ в трекере Wintality"
            ],
            recommendedPrograms: ["Республиканская олимпиада («Дарын»)", "Tech Orda / Astana Hub"]
          },
          {
            month: "Декабрь – Январь",
            title: "Олимпиадные сборы и подготовка эссе",
            priority: "high",
            tasks: [
              "Участие в Международной Жаутыковской олимпиаде (IZhO)",
              "Подготовка драфта мотивационного эссе для летних школ",
              "Запрос рекомендаций у учителей точных наук"
            ],
            recommendedPrograms: ["IZhO 2026", "FLEX Program", "Harvard SSP"]
          },
          {
            month: "Февраль – Март",
            title: "Дедлайны летних программ и финал олимпиад",
            priority: "high",
            tasks: [
              "Подача документов в Nazarbayev University Pre-College",
              "Сдача официального экзамена IELTS",
              "Участие в хакатоне Decentrathon"
            ],
            recommendedPrograms: ["NU Summer Research", "Decentrathon"]
          },
          {
            month: "Апрель – Май",
            title: "Итоги конкурсов и закрепление результатов",
            priority: "medium",
            tasks: [
              "Республиканский финал олимпиад школьников",
              "Получение офферов и подтверждение участия в летних школах",
              "Формирование итогового академического CV"
            ],
            recommendedPrograms: ["Летняя школа NU", "Стажировка Tinkoff Juniors"]
          }
        ],
        successMetrics: [
          "Сертификат IELTS 7.0+",
          "Диплом призера олимпиады РК",
          "Оффер в летнюю исследовательскую программу NU"
        ]
      });
      toast.info("Роадмап построен на основе локальной базы");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в кабинет</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Wintality AI Roadmap Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          AI Personal Academic Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Постройте пошаговый маршрут до конца учебного года: алгоритм Wintality AI рассчитает контрольные точки, ключевые олимпиады Казахстана, международные конкурсы и дедлайны для гарантированного достижения вашей цели.
        </p>
      </div>

      {/* Target Setup */}
      <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Ваша главная академическая цель:
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Текущий класс:
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="8 класс">8 класс</option>
              <option value="9 класс">9 класс</option>
              <option value="10 класс">10 класс</option>
              <option value="11 класс">11 класс</option>
              <option value="Студент 1-2 курса">Студент 1-2 курса</option>
            </select>
          </div>
        </div>

        {/* Goal Presets */}
        <div className="space-y-2">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">
            Или выберите готовую цель:
          </span>
          <div className="flex flex-wrap gap-2">
            {goalPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetGoal(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  targetGoal === preset
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                <span>Генерация дорожной карты...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Сгенерировать стратегический план</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Roadmap Timeline */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Summary */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-2 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold block">
              Стратегия траектории
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {result.goalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {result.strategySummary}
            </p>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Поквартальный план учебного года:</span>
            </h3>

            <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-8">
              {result.milestones.map((ms: RoadmapMilestone, idx: number) => (
                <div key={idx} className="relative group">
                  {/* Dot on line */}
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-4 border-white dark:border-zinc-950 absolute -left-[31px] top-1" />

                  <div className="zinc-card p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold block">
                          Этап {idx + 1} • {ms.month}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {ms.title}
                        </h4>
                      </div>

                      <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded ${
                        ms.priority === "high"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                      }`}>
                        Приоритет: {ms.priority === "high" ? "Высокий" : "Стандартный"}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      <span className="text-[11px] text-zinc-500 font-medium block">
                        Контрольные задачи:
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                        {ms.tasks.map((task: string, tIdx: number) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended programs */}
                    {ms.recommendedPrograms && ms.recommendedPrograms.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-zinc-500 text-[11px]">Рекомендуемые программы:</span>
                        {ms.recommendedPrograms.map((prog: string, pIdx: number) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium"
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          {result.successMetrics && (
            <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Ключевые критерии успеха к концу года:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.successMetrics.map((metric: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1"
                  >
                    <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Метрика {idx + 1}</div>
                    <div className="leading-snug">{metric}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
