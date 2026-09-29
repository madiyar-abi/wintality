"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  UserCheck, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { InterviewRoundData, InterviewFinalEvaluation, InterviewStepResult } from "@/lib/ai/gemini";

const PRESET_PROGRAMS = [
  {
    id: "flex",
    name: "FLEX Program Kazakhstan (U.S. State Dept)",
    description: "Собеседование на полную годовую стипендию в США: фокус на лидерство, адаптивность и культурный обмен.",
    icon: "🇺🇸"
  },
  {
    id: "nu",
    name: "Nazarbayev University (NU Admissions Panel)",
    description: "Интервью приемной комиссии NU: академическая зрелость, мотивация в STEM/CS и исследовательский потенциал.",
    icon: "🇰🇿"
  },
  {
    id: "harvard",
    name: "Harvard Secondary School & Ivy League",
    description: "Академический отбор в Лигу Плюща: интеллектуальная любознательность, оригинальность мышления и вклад в общество.",
    icon: "🏛️"
  },
  {
    id: "startup",
    name: "Tech Orda & Astana Hub Startup Pitch",
    description: "Защита технологического проекта перед инвесторами и экспертами IT-индустрии Казахстана.",
    icon: "🚀"
  },
  {
    id: "isef",
    name: "Regeneron ISEF & Научные олимпиады (Дарын)",
    description: "Защита исследовательского проекта перед международной судейской коллегией ученых.",
    icon: "🔬"
  }
];

export default function MockInterviewPage() {
  const [selectedProgram, setSelectedProgram] = useState(PRESET_PROGRAMS[0].name);
  const [inSession, setInSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState<InterviewRoundData[]>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewFinalEvaluation | null>(null);
  const [copied, setCopied] = useState(false);

  // Speech Recognition Reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ru-RU";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerDraft((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech
  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.info("Синтез речи не поддерживается браузером");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input (Mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.info("Голосовой ввод не поддерживается вашим браузером. Пожалуйста, введите ответ текстом.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Слушаю вас... Говорите в микрофон");
      } catch {
        setIsListening(false);
      }
    }
  };

  // Start interview session
  const handleStartSession = async () => {
    setLoading(true);
    setInSession(true);
    setRounds([]);
    setCurrentRoundNumber(1);
    setEvaluation(null);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "step",
          programName: selectedProgram,
          previousRounds: []
        })
      });

      const data: InterviewStepResult = await res.json();
      setCurrentQuestion(data.nextQuestion);
      setCurrentFeedback(data.feedbackOnAnswer);
      setAnswerDraft("");
    } catch {
      setCurrentQuestion(`Здравствуйте! Расскажите, почему именно программа "${selectedProgram}" стала для вас приоритетом?`);
      setCurrentFeedback("Добро пожаловать на симуляцию интервью.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!answerDraft.trim()) {
      toast.warning("Пожалуйста, введите или надиктуйте ваш ответ");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const updatedRounds = [
      ...rounds,
      {
        roundNumber: currentRoundNumber,
        interviewerQuestion: currentQuestion,
        candidateAnswer: answerDraft.trim()
      }
    ];

    setRounds(updatedRounds);
    setLoading(true);

    if (currentRoundNumber >= 5) {
      // Finished all 5 rounds -> Final Evaluation
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "evaluate",
            programName: selectedProgram,
            allRounds: updatedRounds
          })
        });
        const evalData: InterviewFinalEvaluation = await res.json();
        setEvaluation(evalData);
        toast.success("Интервью успешно завершено! Анализируем результаты...");
      } catch {
        toast.error("Ошибка при генерации отчета");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Next round (2 to 5)
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "step",
          programName: selectedProgram,
          previousRounds: updatedRounds,
          currentAnswer: answerDraft.trim()
        })
      });

      const data: InterviewStepResult = await res.json();
      setCurrentQuestion(data.nextQuestion);
      setCurrentFeedback(data.feedbackOnAnswer);
      setCurrentRoundNumber((prev) => prev + 1);
      setAnswerDraft("");
    } catch {
      setCurrentRoundNumber((prev) => prev + 1);
      setCurrentQuestion("Приведите пример реальной ситуации, когда вам пришлось проявить настойчивость?");
      setAnswerDraft("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!evaluation) return;
    const text = `Wintality AI Admissions Interview Report\nПрограмма: ${selectedProgram}\nИтоговый скоринг: ${evaluation.overallScore}/100\nВердикт: ${evaluation.verdict}\n\nКритерии:\n- Лидерство: ${evaluation.criteriaScores.leadership}/100\n- Критическое мышление: ${evaluation.criteriaScores.criticalThinking}/100\n- Академическая зрелость: ${evaluation.criteriaScores.academicMaturity}/100\n- Коммуникация: ${evaluation.criteriaScores.communication}/100\n\nСильные стороны:\n${evaluation.keyStrengths.map(s => `- ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Отчет скопирован в буфер обмена");
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Wintality AI Admissions Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          AI Симулятор собеседований в приемную комиссию
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Пройдите 5 раундов адаптивного интервью для гранта NU, программы FLEX или международных летних школ. ИИ проверит логику ответов, лидерские качества и предоставит экспертный аудит.
        </p>
      </div>

      {/* Program Selection Step (if not in session or restarted) */}
      {!inSession && !evaluation && (
        <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              Выберите целевую программу для симуляции:
            </h3>
            <p className="text-xs text-zinc-500">
              Интервьюер настроит вопросы под специфику и требования отборочного комитета.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PRESET_PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                onClick={() => setSelectedProgram(prog.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedProgram === prog.name
                    ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <span className="text-2xl">{prog.icon}</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {prog.name}
                  </h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    {prog.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Инициализация...</span>
                </>
              ) : (
                <>
                  <span>Начать 5-раундовое интервью</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Session View */}
      {inSession && !evaluation && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="zinc-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono">Программа:</span>
              <span className="font-bold text-zinc-900 dark:text-white truncate max-w-xs">{selectedProgram}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">Раунд {currentRoundNumber} из 5</span>
              <div className="w-24 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(currentRoundNumber / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feedback on previous round if exists */}
          {currentFeedback && currentRoundNumber > 1 && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[10px] uppercase font-mono tracking-wider">Комментарий интервьюера:</span>
                <span>{currentFeedback}</span>
              </div>
            </div>
          )}

          {/* Interviewer Question Box */}
          <div className="zinc-card p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Член приемной комиссии</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">Вопрос раунда {currentRoundNumber}</span>
                </div>
              </div>

              {/* Text to Speech Button */}
              <button
                type="button"
                onClick={() => handleSpeak(currentQuestion)}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSpeaking
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
                title="Озвучить вопрос голосом"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Остановить" : "Озвучить"}</span>
              </button>
            </div>

            <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
              «{currentQuestion}»
            </p>
          </div>

          {/* Student Answer Box */}
          <div className="zinc-card p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Ваш ответ (аргументируйте четко и приводите примеры):
              </label>

              {/* Voice Input (Speech to text) */}
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isListening
                    ? "bg-rose-500/20 text-rose-600 border-rose-500/30 animate-pulse"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                }`}
                title="Ответить голосом через микрофон"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{isListening ? "Идет запись..." : "Голосовой ввод"}</span>
              </button>
            </div>

            <textarea
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              placeholder="Начните говорить в микрофон или напишите свой ответ здесь..."
              rows={4}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                {answerDraft.length} символов • {answerDraft.split(/\s+/).filter(Boolean).length} слов
              </span>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Анализ ответа...</span>
                  </>
                ) : (
                  <>
                    <span>{currentRoundNumber === 5 ? "Завершить интервью и получить отчет" : "Отправить ответ"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Evaluation Report */}
      {evaluation && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Verdict Card */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                  Итоговый вердикт приемной комиссии
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {evaluation.verdict}
                </h3>
                <p className="text-xs text-zinc-500">
                  Программа: {selectedProgram} • 5 раундов адаптивного аудита
                </p>
              </div>

              <div className="text-right">
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {evaluation.overallScore}%
                </div>
                <div className="text-[10px] text-zinc-400 font-mono uppercase">
                  Admissions Index
                </div>
              </div>
            </div>

            {/* 4 Criteria Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="truncate">Лидерство</span>
                  <span className="font-bold text-indigo-600">{evaluation.criteriaScores.leadership}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${evaluation.criteriaScores.leadership}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="truncate">Крит. мышление</span>
                  <span className="font-bold text-indigo-600">{evaluation.criteriaScores.criticalThinking}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${evaluation.criteriaScores.criticalThinking}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="truncate">Академ. зрелость</span>
                  <span className="font-bold text-indigo-600">{evaluation.criteriaScores.academicMaturity}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${evaluation.criteriaScores.academicMaturity}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="truncate">Коммуникация</span>
                  <span className="font-bold text-indigo-600">{evaluation.criteriaScores.communication}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${evaluation.criteriaScores.communication}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Ключевые сильные стороны:</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {evaluation.keyStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Зоны для усиления:</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {evaluation.growthAreas.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Рекомендации ментора перед реальным интервью:</span>
            </h4>
            <div className="space-y-2">
              {evaluation.actionableRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5"
                >
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                    Совет {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setEvaluation(null);
                setInSession(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Пройти симуляцию заново</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Скопировано" : "Скопировать отчет"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
