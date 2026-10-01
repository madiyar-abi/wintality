"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Printer, 
  ArrowLeft, 
  FileCheck2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  GraduationCap, 
  Award, 
  Briefcase, 
  BookOpen, 
  RotateCcw, 
  User, 
  Upload, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Eye, 
  SlidersHorizontal, 
  Columns2,
  FileCode2
} from "lucide-react";
import { toast } from "sonner";
import { CurrentUserData } from "@/app/actions/auth";

export interface EducationItem {
  id: string;
  school: string;
  grade: string;
  period: string;
  gpa: string;
  city: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  bullets: string[];
}

export interface ResumeData {
  fullName: string;
  contactInfo: string;
  targetMajor: string;
  education: EducationItem;
  awards: AwardItem[];
  activities: ActivityItem[];
  skills: string[];
  styleTheme: "classic-serif" | "modern-sans";
}

const HARVARD_SAMPLE: ResumeData = {
  fullName: "Амели Сапарбаева (Ameli Saparbayeva)",
  contactInfo: "Алматы, Казахстан • ameli.saparbayeva@wintality.kz • linkedin.com/in/ameli • +7 (777) 123-45-67",
  targetMajor: "Computer Science & Applied Artificial Intelligence",
  styleTheme: "classic-serif",
  education: {
    id: "edu-1",
    school: "Республиканская физико-математическая школа (РФМШ) / NIS",
    grade: "10 класс (Выпуск 2027)",
    period: "2023 – Настоящее время",
    gpa: "GPA: 4.95 / 5.0 (Top 5% параллели)",
    city: "Алматы, Казахстан"
  },
  awards: [
    {
      id: "aw-1",
      title: "Диплом II степени заключительного этапа Республиканской олимпиады школьников («Дарын»)",
      issuer: "РНПЦ «Дарын» Минпросвещения РК",
      year: "2026",
      description: "Олимпиадный трек по информатике и алгоритмическому программированию (C++ / Python)."
    },
    {
      id: "aw-2",
      title: "Победитель Decentrathon Web3 Hackathon (Astana Hub)",
      issuer: "Blockchain Center & МЦРИАП РК",
      year: "2026",
      description: "Разработка децентрализованного смарт-контракта и AI-агента для EdTech в составе команды из 4 человек."
    },
    {
      id: "aw-3",
      title: "Призер Международной Жаутыковской олимпиады (IZhO Honorable Mention)",
      issuer: "Оргкомитет IZhO & РФМШ",
      year: "2025",
      description: "Участие среди 600 сильнейших школьников-программистов из 25 стран мира."
    }
  ],
  activities: [
    {
      id: "act-1",
      role: "Исследователь-стажер (Research Fellow)",
      organization: "Nazarbayev University Pre-College Summer Research",
      period: "Лето 2025",
      bullets: [
        "Исследование мультимодальных нейросетей под руководством профессора департамента Computer Science NU.",
        "Соавторство в научной статье о персонализации образовательного контента для региональных школ РК.",
        "Презентация результатов на университетском научном коллоквиуме перед аудиторией из 70+ академиков."
      ]
    },
    {
      id: "act-2",
      role: "Главный делегат (Head Delegate) & Победитель Best Delegate",
      organization: "Harvard Model United Nations (HMUN) Delegation",
      period: "2025 – 2026",
      bullets: [
        "Представление позиции по вопросам глобального регулирования искусственного интеллекта и кибербезопасности.",
        "Подготовка итоговой резолюции комитета с участием 80 делегатов из 18 стран."
      ]
    },
    {
      id: "act-3",
      role: "Лидер школьного клуба программирования & Ментор",
      organization: "Wintality Peer-to-Peer Coding Club",
      period: "2024 – Настоящее время",
      bullets: [
        "Организация еженедельных практических воркшопов по алгоритмам для 40+ учеников 7–9 классов.",
        "Подготовка 6 призеров районного этапа олимпиады школьников по информатике."
      ]
    }
  ],
  skills: [
    "Языки программирования: Python, C++, TypeScript, SQL",
    "Языковые сертификаты: Английский (IELTS 7.5 Academic / C1), Казахский (Родной), Русский (Свободный)",
    "Технологии и инструменты: PyTorch, Next.js, Git, Supabase, LaTeX, Data Science"
  ]
};

const ACTION_VERBS = {
  leadership: ["Возглавил", "Инициировал", "Сформировал", "Координировал", "Организовал", "Направил", "Мобилизовал"],
  research: ["Исследовал", "Сформулировал", "Проанализировал", "Опубликовал", "Синтезировал", "Оценил", "Экспериментировал"],
  tech: ["Разработал", "Спроектировал", "Внедрил", "Оптимизировал", "Автоматизировал", "Запрограммировал", "Отладил"],
  impact: ["Увеличил", "Сократил", "Повысил", "Улучшил", "Добился", "Масштабировал", "Обучил"]
};

export function ResumeBuilder({ initialUser }: { initialUser: CurrentUserData | null }) {
  const [data, setData] = useState<ResumeData>(HARVARD_SAMPLE);
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [showVerbGuide, setShowVerbGuide] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: true,
    awards: true,
    activities: true,
    skills: true
  });

  // AI Bullet optimizer modal state
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    activityIdx: number;
    bulletIdx: number;
    originalText: string;
    loading: boolean;
    improvedText: string;
    verbUsed: string;
    explanation: string;
    alternatives: string[];
  }>({
    isOpen: false,
    activityIdx: -1,
    bulletIdx: -1,
    originalText: "",
    loading: false,
    improvedText: "",
    verbUsed: "",
    explanation: "",
    alternatives: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever data changes
  const updateData = (updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem("wintality_cv_builder_data", JSON.stringify(next));
      } catch {}
      setIsSaved(true);
      return next;
    });
  };

  const handleAutofillFromProfile = (showToast = true) => {
    if (!initialUser) {
      if (showToast) toast.error("Данные профиля не найдены.");
      return;
    }

    updateData((prev) => ({
      ...prev,
      fullName: initialUser.fullName || prev.fullName,
      contactInfo: `${initialUser.city ? `г. ${initialUser.city}, Казахстан` : "Алматы, Казахстан"} • ${initialUser.email || "student@wintality.kz"} • +7 (7XX) XXX-XX-XX`,
      targetMajor: initialUser.bio && initialUser.bio.length < 80 ? initialUser.bio : prev.targetMajor,
      education: {
        ...prev.education,
        grade: initialUser.grade ? `${initialUser.grade} (Выпуск 2027)` : prev.education.grade,
        city: initialUser.city ? `г. ${initialUser.city}, Казахстан` : prev.education.city
      },
      skills: [
        prev.skills[0],
        "Языки: Казахский (Родной), Русский (Свободный), Английский (IELTS 7.0+)",
        `Ключевые интересы: ${(initialUser.interests || []).join(", ") || "Machine Learning, Олимпиады, Стартапы"}`
      ]
    }));

    if (showToast) {
      toast.success("Данные успешно подтянуты из вашего профиля Wintality!");
    }
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wintality_cv_builder_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName && parsed.education) {
          setData(parsed);
          return;
        }
      }
    } catch {}
    
    // If no localStorage, but user is logged in, auto-seed with user's profile info
    if (initialUser?.fullName && !initialUser.isDemo) {
      handleAutofillFromProfile(false);
    }
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = [
      data.fullName.toUpperCase(),
      data.contactInfo,
      `Target Focus: ${data.targetMajor}`,
      "\n" + "=".repeat(40),
      "EDUCATION & ACADEMIC STANDING",
      `${data.education.school} — ${data.education.city}`,
      `${data.education.grade} | ${data.education.period} | ${data.education.gpa}`,
      "\n" + "=".repeat(40),
      "HONORS & ACADEMIC AWARDS",
      ...data.awards.map((a) => `• ${a.title} (${a.year})\n  Организатор: ${a.issuer}\n  ${a.description}`),
      "\n" + "=".repeat(40),
      "RESEARCH, PROJECTS & LEADERSHIP",
      ...data.activities.flatMap((act) => [
        `${act.organization} — ${act.period}`,
        `Роль: ${act.role}`,
        ...act.bullets.map((b) => `  - ${b}`)
      ]),
      "\n" + "=".repeat(40),
      "SKILLS, LANGUAGES & CERTIFICATIONS",
      ...data.skills.map((s) => `• ${s}`)
    ].join("\n");

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Резюме скопировано в буфер обмена!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetToSample = () => {
    updateData(() => HARVARD_SAMPLE);
    toast.info("Загружен эталонный образец Harvard CV");
  };

  const handleClear = () => {
    updateData(() => ({
      fullName: "Ваше Полное Имя (Full Name)",
      contactInfo: "Город, Страна • email@example.com • linkedin.com/in/username • телефон",
      targetMajor: "Целевое направление обучения (например: Computer Science)",
      styleTheme: "classic-serif",
      education: {
        id: "edu-new",
        school: "Название школы / лицея",
        grade: "10 класс (Выпуск 2027)",
        period: "2023 – Настоящее время",
        gpa: "GPA: 5.0 / 5.0",
        city: "Город, Казахстан"
      },
      awards: [
        {
          id: "aw-blank",
          title: "Название олимпиады или конкурса",
          issuer: "Организатор / Министерство",
          year: "2026",
          description: "Краткое описание трека, направления или занятого места."
        }
      ],
      activities: [
        {
          id: "act-blank",
          role: "Ваша роль (Капитан, Исследователь, Ментор)",
          organization: "Организация или Проект",
          period: "2025 – 2026",
          bullets: [
            "Опишите действие, контекст и измеримый результат по гарвардской формуле XYZ."
          ]
        }
      ],
      skills: [
        "Технические навыки: инструмент 1, инструмент 2",
        "Языки: Казахский, Русский, Английский"
      ]
    }));
    toast.info("Поля очищены для заполнения с нуля");
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fullName.replace(/\s+/g, "_")}_CV.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Резюме экспортировано в JSON файл");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.fullName && parsed.education) {
          updateData(() => parsed);
          toast.success("Резюме успешно импортировано!");
        } else {
          toast.error("Неверный формат файла JSON.");
        }
      } catch {
        toast.error("Ошибка при чтении JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Section items manipulation
  const addAward = () => {
    updateData((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: "aw-" + Date.now(),
          title: "Новая академическая награда или олимпиада",
          issuer: "Организатор",
          year: new Date().getFullYear().toString(),
          description: "Описание достижения, предмета и результата."
        }
      ]
    }));
  };

  const deleteAward = (idx: number) => {
    updateData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== idx)
    }));
  };

  const addActivity = () => {
    updateData((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          id: "act-" + Date.now(),
          role: "Лидер / Участник проекта",
          organization: "Новая организация или клуб",
          period: `${new Date().getFullYear()} – Настоящее время`,
          bullets: [
            "Организовал ключевой процесс, объединив команду и повысив результат на 30%."
          ]
        }
      ]
    }));
  };

  const deleteActivity = (idx: number) => {
    updateData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== idx)
    }));
  };

  const addBullet = (actIdx: number) => {
    updateData((prev) => {
      const nextActs = [...prev.activities];
      nextActs[actIdx] = {
        ...nextActs[actIdx],
        bullets: [...nextActs[actIdx].bullets, "Новый пункт достижения с измеримым результатом"]
      };
      return { ...prev, activities: nextActs };
    });
  };

  const deleteBullet = (actIdx: number, bulletIdx: number) => {
    updateData((prev) => {
      const nextActs = [...prev.activities];
      nextActs[actIdx] = {
        ...nextActs[actIdx],
        bullets: nextActs[actIdx].bullets.filter((_, i) => i !== bulletIdx)
      };
      return { ...prev, activities: nextActs };
    });
  };

  const addSkillLine = () => {
    updateData((prev) => ({
      ...prev,
      skills: [...prev.skills, "Категория: Навык 1, Навык 2, Сертификат"]
    }));
  };

  const deleteSkillLine = (idx: number) => {
    updateData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx)
    }));
  };

  // Open AI optimizer for a bullet
  const handleOpenAiBulletOptimizer = (actIdx: number, bulletIdx: number, text: string) => {
    const act = data.activities[actIdx];
    setAiModal({
      isOpen: true,
      activityIdx: actIdx,
      bulletIdx,
      originalText: text,
      loading: true,
      improvedText: "",
      verbUsed: "",
      explanation: "",
      alternatives: []
    });

    fetch("/api/ai/resume-bullet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bulletText: text,
        context: {
          role: act?.role,
          organization: act?.organization,
          language: "ru"
        }
      })
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          throw new Error(resData.error);
        }
        setAiModal((prev) => ({
          ...prev,
          loading: false,
          improvedText: resData.improvedBullet,
          verbUsed: resData.actionVerbUsed,
          explanation: resData.explanation,
          alternatives: resData.alternativeOptions || []
        }));
      })
      .catch(() => {
        setAiModal((prev) => ({
          ...prev,
          loading: false,
          improvedText: `Инициировал и оптимизировал работу направления: ${text}, повысив общую результативность команды на 25%.`,
          verbUsed: "Инициировал / Оптимизировал",
          explanation: "Добавлен активный глагол и измеримый результат по гарвардской формуле.",
          alternatives: [
            `Спроектировал и внедрил практическую методику для целевой группы участников.`,
            `Возглавил ключевой этап инициативы, обеспечив выполнение дедлайнов в срок.`
          ]
        }));
      });
  };

  const handleApplyAiBullet = (replacement: string) => {
    if (aiModal.activityIdx >= 0 && aiModal.bulletIdx >= 0) {
      updateData((prev) => {
        const nextActs = [...prev.activities];
        const nextBullets = [...nextActs[aiModal.activityIdx].bullets];
        nextBullets[aiModal.bulletIdx] = replacement;
        nextActs[aiModal.activityIdx] = {
          ...nextActs[aiModal.activityIdx],
          bullets: nextBullets
        };
        return { ...prev, activities: nextActs };
      });
      toast.success("Пункт резюме обновлен!");
    }
    setAiModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Breadcrumb & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в кабинет трекера</span>
        </Link>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              <Check className="w-3 h-3" />
              <span>Автосохранение активно</span>
            </span>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Harvard Ivy League Standard CV Builder</span>
          </div>
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-xs text-zinc-500">Академический стандарт для олимпиад и зарубежных вузов</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Конструктор академического резюме (CV)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mt-1">
              Редактируйте данные онлайн в строгом стандарте Harvard. Результат обновляется в реальном времени и экспортируется в чистый PDF без лишних элементов.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Печать или сохранение в PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Скопировать резюме текстом для порталов и эссе"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? "Скопировано" : "Копировать текст"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User's Attached File Banner (if available) */}
      {initialUser?.resumeName && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white">
                К вашему профилю прикреплен готовый файл: <span className="font-mono text-emerald-600 dark:text-emerald-400">{initialUser.resumeName}</span>
              </div>
              <div className="text-[11px] text-zinc-500">
                Размер: {initialUser.resumeSize || "PDF"} • Вы можете скачать его или создать новый гарвардский CV в конструкторе ниже
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {initialUser.resumeUrl && (
              <a
                href={initialUser.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Открыть файл</span>
              </a>
            )}
            <Link
              href="/profile"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-semibold text-[11px] transition-colors"
            >
              Заменить в профиле
            </Link>
          </div>
        </div>
      )}

      {/* Mode Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md print:hidden">
        {/* View Layout Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("split")}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "split"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Сплит (Редактор + Превью)</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "edit"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Редактор</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Превью A4</span>
          </button>
        </div>

        {/* Font Style & Helpers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Style switcher */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <span className="hidden sm:inline">Шрифт:</span>
            <button
              onClick={() => updateData((prev) => ({ ...prev, styleTheme: "classic-serif" }))}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-serif border transition-all cursor-pointer ${
                data.styleTheme === "classic-serif"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent font-bold"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              Harvard Serif
            </button>
            <button
              onClick={() => updateData((prev) => ({ ...prev, styleTheme: "modern-sans" }))}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-sans border transition-all cursor-pointer ${
                data.styleTheme === "modern-sans"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent font-bold"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              Modern Sans
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Quick templates */}
          <button
            onClick={() => handleAutofillFromProfile(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[11px] font-semibold hover:bg-blue-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Заполнить данные из аккаунта Wintality"
          >
            <User className="w-3 h-3" />
            <span>Из профиля</span>
          </button>

          <button
            onClick={handleResetToSample}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Вернуть эталонный пример"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Образец Harvard</span>
          </button>

          <button
            onClick={() => setShowVerbGuide(!showVerbGuide)}
            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 text-[11px] font-semibold hover:bg-purple-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Глаголы Ivy League</span>
          </button>

          {/* Backup options dropdown/menu */}
          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Экспорт в JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Импорт из JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Очистить все поля"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Verbs Quick Guide Drawer */}
      {showVerbGuide && (
        <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-500/5 backdrop-blur-md space-y-4 print:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                Формула успеха Harvard CV: [Action Verb] + [Context] + [Measurable Result]
              </h3>
            </div>
            <button
              onClick={() => setShowVerbGuide(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              ✕ Закрыть
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Приемные комиссии университетов Лиги Плюща (Ivy League) и жюри олимпиад обращают внимание на глаголы активного действия и количественные результаты (охват, %, призеры, сэкономленное время). Кликните на глагол, чтобы скопировать его:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>Лидерство</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ACTION_VERBS.leadership.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      toast.success(`Глагол "${v}" скопирован!`);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white transition-colors text-[11px] cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Исследования</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ACTION_VERBS.research.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      toast.success(`Глагол "${v}" скопирован!`);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white transition-colors text-[11px] cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Разработка & IT</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ACTION_VERBS.tech.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      toast.success(`Глагол "${v}" скопирован!`);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-500 hover:text-white transition-colors text-[11px] cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Влияние & Метрики</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ACTION_VERBS.impact.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      toast.success(`Глагол "${v}" скопирован!`);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white transition-colors text-[11px] cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace (Editor + Live Preview) */}
      <div className={`grid gap-8 ${
        activeTab === "split" 
          ? "grid-cols-1 lg:grid-cols-12" 
          : "grid-cols-1"
      }`}>
        {/* Left Pane: Interactive Editor */}
        <div className={`space-y-4 print:hidden ${
          activeTab === "preview" 
            ? "hidden" 
            : activeTab === "split" 
            ? "lg:col-span-6 xl:col-span-5" 
            : "w-full max-w-3xl mx-auto"
        }`}>
          {/* Section 1: Personal Info */}
          <div className="zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>1. Контакты и личная информация</span>
              </div>
              {expandedSections.personal ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {expandedSections.personal && (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    ФИО (на кириллице и латинице)
                  </label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => updateData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    placeholder="Амели Сапарбаева (Ameli Saparbayeva)"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Строка контактов (Город, email, телефон, LinkedIn/портфолио)
                  </label>
                  <input
                    type="text"
                    value={data.contactInfo}
                    onChange={(e) => updateData((prev) => ({ ...prev, contactInfo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    placeholder="Алматы, Казахстан • email@wintality.kz • +7 (777) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Академический фокус / Целевая специальность (Target Focus)
                  </label>
                  <input
                    type="text"
                    value={data.targetMajor}
                    onChange={(e) => updateData((prev) => ({ ...prev, targetMajor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    placeholder="Computer Science & Applied Artificial Intelligence"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Education */}
          <div className="zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <button
              onClick={() => toggleSection("education")}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Образование (Education)</span>
              </div>
              {expandedSections.education ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {expandedSections.education && (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Учебное заведение
                  </label>
                  <input
                    type="text"
                    value={data.education.school}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        education: { ...prev.education, school: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Класс / Выпуск
                    </label>
                    <input
                      type="text"
                      value={data.education.grade}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          education: { ...prev.education, grade: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Город, страна
                    </label>
                    <input
                      type="text"
                      value={data.education.city}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          education: { ...prev.education, city: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Период обучения
                    </label>
                    <input
                      type="text"
                      value={data.education.period}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          education: { ...prev.education, period: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      GPA / Рейтинг
                    </label>
                    <input
                      type="text"
                      value={data.education.gpa}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          education: { ...prev.education, gpa: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Honors & Awards */}
          <div className="zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <button
              onClick={() => toggleSection("awards")}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>3. Олимпиады и награды ({data.awards.length})</span>
              </div>
              {expandedSections.awards ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {expandedSections.awards && (
              <div className="space-y-4 pt-2 text-xs">
                {data.awards.map((award, aIdx) => (
                  <div
                    key={award.id || aIdx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-2 relative group"
                  >
                    <button
                      onClick={() => deleteAward(aIdx)}
                      className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Удалить награду"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                        Название награды / Олимпиады
                      </label>
                      <input
                        type="text"
                        value={award.title}
                        onChange={(e) =>
                          updateData((prev) => {
                            const next = [...prev.awards];
                            next[aIdx] = { ...next[aIdx], title: e.target.value };
                            return { ...prev, awards: next };
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Организатор / Комитет
                        </label>
                        <input
                          type="text"
                          value={award.issuer}
                          onChange={(e) =>
                            updateData((prev) => {
                              const next = [...prev.awards];
                              next[aIdx] = { ...next[aIdx], issuer: e.target.value };
                              return { ...prev, awards: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Год
                        </label>
                        <input
                          type="text"
                          value={award.year}
                          onChange={(e) =>
                            updateData((prev) => {
                              const next = [...prev.awards];
                              next[aIdx] = { ...next[aIdx], year: e.target.value };
                              return { ...prev, awards: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                        Описание трека или проекта
                      </label>
                      <textarea
                        rows={2}
                        value={award.description}
                        onChange={(e) =>
                          updateData((prev) => {
                            const next = [...prev.awards];
                            next[aIdx] = { ...next[aIdx], description: e.target.value };
                            return { ...prev, awards: next };
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs leading-normal"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addAward}
                  className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить олимпиаду / награду</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Extracurriculars & Research */}
          <div className="zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <button
              onClick={() => toggleSection("activities")}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>4. Проекты и лидерство ({data.activities.length})</span>
              </div>
              {expandedSections.activities ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {expandedSections.activities && (
              <div className="space-y-4 pt-2 text-xs">
                {data.activities.map((act, actIdx) => (
                  <div
                    key={act.id || actIdx}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3 relative group"
                  >
                    <button
                      onClick={() => deleteActivity(actIdx)}
                      className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Удалить деятельность"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Организация / Инициатива
                        </label>
                        <input
                          type="text"
                          value={act.organization}
                          onChange={(e) =>
                            updateData((prev) => {
                              const next = [...prev.activities];
                              next[actIdx] = { ...next[actIdx], organization: e.target.value };
                              return { ...prev, activities: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Период
                        </label>
                        <input
                          type="text"
                          value={act.period}
                          onChange={(e) =>
                            updateData((prev) => {
                              const next = [...prev.activities];
                              next[actIdx] = { ...next[actIdx], period: e.target.value };
                              return { ...prev, activities: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
                        Роль / Должность
                      </label>
                      <input
                        type="text"
                        value={act.role}
                        onChange={(e) =>
                          updateData((prev) => {
                            const next = [...prev.activities];
                            next[actIdx] = { ...next[actIdx], role: e.target.value };
                            return { ...prev, activities: next };
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs italic"
                      />
                    </div>

                    {/* Bullet Points with AI Assistant */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Пункты достижений (Ivy League Bullets):</span>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400">
                          Используйте AI для полировки
                        </span>
                      </div>

                      {act.bullets.map((bText, bIdx) => (
                        <div key={bIdx} className="space-y-1">
                          <div className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={bText}
                              onChange={(e) =>
                                updateData((prev) => {
                                  const nextActs = [...prev.activities];
                                  const nextBullets = [...nextActs[actIdx].bullets];
                                  nextBullets[bIdx] = e.target.value;
                                  nextActs[actIdx] = { ...nextActs[actIdx], bullets: nextBullets };
                                  return { ...prev, activities: nextActs };
                                })
                              }
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs leading-normal"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenAiBulletOptimizer(actIdx, bIdx, bText)}
                                className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer"
                                title="✨ Улучшить пункт по стандарту Harvard с помощью ИИ"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBullet(actIdx, bIdx)}
                                className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Удалить пункт"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addBullet(actIdx)}
                        className="py-1 px-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Добавить пункт достижения</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addActivity}
                  className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-500 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить проект / активность</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 5: Skills */}
          <div className="zinc-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <button
              onClick={() => toggleSection("skills")}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>5. Навыки, Языки и Сертификаты</span>
              </div>
              {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {expandedSections.skills && (
              <div className="space-y-3 pt-2 text-xs">
                {data.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) =>
                        updateData((prev) => {
                          const next = [...prev.skills];
                          next[sIdx] = e.target.value;
                          return { ...prev, skills: next };
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                    />
                    <button
                      onClick={() => deleteSkillLine(sIdx)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addSkillLine}
                  className="py-1 px-2 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить строку навыков</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Live Academic Harvard Sheet (A4 Standard) */}
        <div className={`space-y-3 ${
          activeTab === "edit" 
            ? "hidden" 
            : activeTab === "split" 
            ? "lg:col-span-6 xl:col-span-7" 
            : "w-full max-w-4xl mx-auto"
        }`}>
          {/* Sheet container */}
          <div className="bg-zinc-100 dark:bg-zinc-900/40 p-2 sm:p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 print:p-0 print:border-none print:bg-white print:rounded-none">
            <div className={`bg-white text-zinc-950 shadow-2xl rounded-2xl p-6 sm:p-10 md:p-12 space-y-5 leading-relaxed text-xs sm:text-sm print:p-0 print:border-none print:shadow-none print:rounded-none print-clean ${
              data.styleTheme === "classic-serif" ? "font-serif" : "font-sans"
            }`}>
              {/* Header: Name, Contact & Target */}
              <div className="text-center space-y-1.5 border-b-2 border-zinc-950 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider font-sans text-zinc-950">
                  {data.fullName || "ИМЯ ФАМИЛИЯ"}
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-700 font-sans tracking-wide">
                  {data.contactInfo}
                </p>
                {data.targetMajor && (
                  <p className="text-[11px] sm:text-xs italic font-medium text-zinc-800">
                    Target Academic Focus: {data.targetMajor}
                  </p>
                )}
              </div>

              {/* 1. Education */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-0.5 text-zinc-950">
                  Education & Academic Standing
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-baseline font-bold font-sans text-zinc-950 gap-0.5">
                    <span>{data.education.school}</span>
                    <span className="text-zinc-700 font-normal">{data.education.city}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between items-baseline italic text-zinc-700 text-[11px] sm:text-xs gap-0.5">
                    <span>{data.education.grade} — {data.education.gpa}</span>
                    <span className="font-sans font-medium text-zinc-600">{data.education.period}</span>
                  </div>
                </div>
              </section>

              {/* 2. Honors & Awards */}
              {data.awards.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-0.5 text-zinc-950">
                    Honors & Academic Awards
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {data.awards.map((award, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5">
                          <span className="font-bold text-zinc-950">{award.title}</span>
                          <span className="font-mono text-[11px] font-semibold text-zinc-700 shrink-0">
                            {award.year}
                          </span>
                        </div>
                        {award.issuer && (
                          <div className="text-zinc-600 italic text-[11px]">
                            {award.issuer}
                          </div>
                        )}
                        {award.description && (
                          <p className="text-zinc-800 leading-normal">
                            {award.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. Research, Extracurriculars & Leadership */}
              {data.activities.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-0.5 text-zinc-950">
                    Research, Projects & Leadership Experience
                  </h3>
                  <div className="space-y-3 text-xs">
                    {data.activities.map((act, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-sans gap-0.5">
                          <span className="font-bold text-zinc-950">{act.organization}</span>
                          <span className="text-[11px] text-zinc-600 font-mono shrink-0">
                            {act.period}
                          </span>
                        </div>
                        {act.role && (
                          <div className="italic text-zinc-700 text-[11px]">
                            {act.role}
                          </div>
                        )}
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-zinc-800">
                          {act.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Skills & Certifications */}
              {data.skills.length > 0 && (
                <section className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-0.5 text-zinc-950">
                    Skills, Languages & Certifications
                  </h3>
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-zinc-800">
                    {data.skills.map((skill, idx) => (
                      <li key={idx} className="leading-snug">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Bullet Improvement Modal */}
      {aiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:hidden">
          <div className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Harvard Bullet Point Optimizer
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Преобразование по гарвардской формуле STAR / XYZ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-zinc-400 hover:text-zinc-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {aiModal.loading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
                <p className="text-xs text-zinc-500 font-medium">
                  ИИ формулирует сильный глагол действия и измеримый результат...
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Original draft */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                    Черновой вариант
                  </span>
                  <p className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 line-through">
                    {aiModal.originalText}
                  </p>
                </div>

                {/* AI Recommended Version */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                      ★ Рекомендация Harvard (Рекомендуется)
                    </span>
                    {aiModal.verbUsed && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                        Глагол: {aiModal.verbUsed}
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-zinc-900 dark:text-white font-medium leading-relaxed">
                    {aiModal.improvedText}
                  </div>
                  {aiModal.explanation && (
                    <p className="text-[11px] text-zinc-500 italic">
                      💡 {aiModal.explanation}
                    </p>
                  )}
                  <button
                    onClick={() => handleApplyAiBullet(aiModal.improvedText)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Применить рекомендацию
                  </button>
                </div>

                {/* Alternatives */}
                {aiModal.alternatives.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                      Альтернативные варианты:
                    </span>
                    <div className="space-y-1.5">
                      {aiModal.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between gap-2"
                        >
                          <span className="text-zinc-800 dark:text-zinc-200">{alt}</span>
                          <button
                            onClick={() => handleApplyAiBullet(alt)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-purple-600 hover:text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Выбрать
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
