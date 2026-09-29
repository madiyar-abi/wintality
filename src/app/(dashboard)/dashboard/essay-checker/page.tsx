"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  Loader2, 
  Copy, 
  Check 
} from "lucide-react";
import { EssayReviewResult } from "@/lib/ai/gemini";
import { toast } from "sonner";

export default function EssayCheckerPage() {
  const [essayText, setEssayText] = useState("");
  const [targetGoal, setTargetGoal] = useState("Поступление в Nazarbayev University (NU) на грант");
  const [language, setLanguage] = useState<"ru" | "kz" | "en">("ru");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssayReviewResult | null>(null);
  const [copied, setCopied] = useState(false);

  const goalPresets = [
    "Поступление в Nazarbayev University (NU) на грант",
    "Программа обмена FLEX (США, 100% стипендия)",
    "Harvard Secondary School Program (SSP)",
    "nFactorial Incubator / Стартап-программа",
    "Wharton Global Investment Competition",
    "Грант в IT-университет (КБТУ, AITU, МУИТ)"
  ];

  const sampleEssay = `Меня всегда привлекали информационные технологии и то, как алгоритмы могут решать реальные проблемы. В прошлом году я участвовал в школьном этапе Республиканской олимпиады по информатике и занял призовое место. Я многому научился и хочу развиваться дальше в области искусственного интеллекта. Поступление на программу для меня — это главная цель, потому что здесь лучшие преподаватели и сильное сообщество студентов. Я трудолюбив, умею работать в команде и обещаю внести вклад в студенческую жизнь.`;

  const handleInsertSample = () => {
    setEssayText(sampleEssay);
    toast.info("Вставлен пример мотивационного письма");
  };

  const handleReview = async () => {
    if (!essayText.trim() || essayText.trim().length < 30) {
      setError("Пожалуйста, введите текст эссе (минимум 30 символов).");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/review-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essayText,
          targetGoal,
          language
        })
      });

      if (!res.ok) {
        throw new Error("Ошибка при анализе эссе");
      }

      const data = (await res.json()) as EssayReviewResult;
      setResult(data);
      toast.success("Аудит эссе завершен!");
    } catch {
      setError("Не удалось выполнить проверку. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTips = () => {
    if (!result?.personalizedTips) return;
    navigator.clipboard.writeText(result.personalizedTips.join("\n"));
    setCopied(true);
    toast.success("Советы скопированы в буфер обмена!");
    setTimeout(() => setCopied(false), 2000);
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
          <span>Wintality AI Core</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          AI Essay & Motivation Letter Reviewer
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Проверьте черновик мотивационного письма перед подачей на грант Назарбаев Университета, FLEX, летние школы Лиги Плюща или в инкубаторы. ИИ оценит структуру, академический тон и предложит точечные улучшения.
        </p>
      </div>

      {/* Target Goal Selector & Language */}
      <div className="zinc-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
            Цель подачи заявки:
          </label>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-zinc-500">Язык ответа:</span>
            {(["ru", "kz", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] uppercase transition-colors ${
                  language === l
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {goalPresets.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setTargetGoal(goal)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                targetGoal === goal
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Box */}
      <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
            Текст вашего мотивационного письма (на русском, казахском или английском):
          </label>
          <button
            type="button"
            onClick={handleInsertSample}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Вставить пример черновика
          </button>
        </div>

        <textarea
          rows={8}
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Вставьте черновик эссе сюда. Расскажите о вашем опыте, почему вы выбрали именно эту программу и какой вклад планируете внести..."
          className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            Слов: {essayText.trim() ? essayText.trim().split(/\s+/).length : 0} | Символов: {essayText.length}
          </span>

          <button
            onClick={handleReview}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                <span>ИИ-анализ эссе...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Проверить эссе</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Review Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Score & General Feedback */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  Оценка приемной комиссии
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Общий вердикт и сила аргументации
                </h3>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {result.overallScore}/10
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Admissions Index
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p><strong>Структура:</strong> {result.structureFeedback}</p>
              <p><strong>Тон и академический стиль:</strong> {result.toneAndStyle}</p>
            </div>
          </div>

          {/* Phrasing & Improvements */}
          {result.languageImprovements && result.languageImprovements.length > 0 && (
            <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Рекомендуемые стилистические улучшения:</span>
              </h3>

              <div className="space-y-3">
                {result.languageImprovements.map((item: { original: string; suggested: string; reason: string }, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="text-rose-600 dark:text-rose-400 font-mono line-through opacity-80">
                      «{item.original}»
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      → «{item.suggested}»
                    </div>
                    <p className="text-zinc-500 text-[11px] pt-1">
                      💡 {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3 Personalized Tips */}
          {result.personalizedTips && (
            <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>3 совета, как выделиться среди конкурентов:</span>
                </h3>
                <button
                  onClick={handleCopyTips}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Скопировано" : "Скопировать"}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {result.personalizedTips.map((tip: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-800 dark:text-zinc-200">
                    <span className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
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
