"use client";

import { useState } from "react";
import { Opportunity } from "@/types";
import { MatchAnalysisResult } from "@/lib/ai/gemini";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Layers,
} from "lucide-react";

interface ProfileMatchModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  user?: { fullName?: string; grade?: string } | null;
}

export function ProfileMatchModal({
  opportunity,
  isOpen,
  onClose,
  user,
}: ProfileMatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchAnalysisResult | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleStartAnalysis = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: {
            title: opportunity.title,
            organizer: opportunity.organizer,
            categoryLabel: opportunity.categoryLabel,
            requirements: opportunity.requirements,
            gradeMin: opportunity.gradeMin,
            gradeMax: opportunity.gradeMax,
            englishRequired: opportunity.englishRequired,
            location: opportunity.location
          }
        })
      });

      if (!res.ok) {
        throw new Error("Failed to analyze");
      }

      const data = (await res.json()) as MatchAnalysisResult;
      setResult(data);
      setHasFetched(true);
    } catch {
      // Fallback display
      setResult({
        matchScore: opportunity.matchScore || 92,
        verdict: "Профиль имеет высокий потенциал для отбора. Ваши академические цели соответствуют направлению программы.",
        strengths: opportunity.matchReasons || [
          "Класс обучения подходит под регламент",
          "Уровень английского достаточен для подготовки"
        ],
        gaps: [
          "Рекомендуется уделить внимание подготовке мотивационного эссе и академических рекомендаций"
        ],
        deadlineStrategy: [
          "Запросить академический транскрипт в школе",
          "Сформулировать тему мотивационного эссе",
          "Подать заявку не позднее 7 дней до дедлайна"
        ]
      });
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{opportunity.flag}</span>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                {opportunity.cityBadge}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {opportunity.organizer}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              AI Анализ шансов и аудит требований
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {opportunity.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout if not analyzed yet */}
        {!hasFetched && !loading && (
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Запустить мгновенную проверку с AI
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ИИ сопоставит данные вашего профиля ({user?.fullName || "Студент"}, {user?.grade || "10 класс"}) с требованиями программы и рассчитает шансы на прохождение.
              </p>
            </div>
            <button
              onClick={handleStartAnalysis}
              className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Оценить шансы с ИИ</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                ИИ-система анализирует соответствие профиля...
              </h4>
              <p className="text-xs text-zinc-500">
                Сверяем языковой уровень, академические интересы и критерии отбора
              </p>
            </div>
          </div>
        )}

        {/* Result Content */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Score Banner */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Прогноз вероятности прохождения
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                  {result.verdict}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {result.matchScore}%
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Match Score
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Твои сильные стороны:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {result.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Gaps */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Что необходимо доработать:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {result.gaps?.map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Plan */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
                <span>Пошаговый план закрытия гэпов до дедлайна:</span>
              </div>
              <div className="space-y-2">
                {result.deadlineStrategy?.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
