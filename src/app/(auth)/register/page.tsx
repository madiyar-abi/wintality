"use client";

import { useState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  MapPin, 
  FileText, 
  Sparkles, 
  Plus, 
  X, 
  ArrowRight, 
  Loader2 
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { WintalityIcon } from "@/components/ui/Logo";

const SUGGESTED_INTERESTS = [
  "Олимпиадная математика",
  "Machine Learning & AI",
  "Astrophysics & Космонавтика",
  "MUN & Дебаты",
  "FinTech & Инвестиции",
  "Биотехнологии & Медицина",
  "Спортивное программирование (C++)",
  "FLEX & Международные гранты",
  "Робототехника & HardTech",
  "Nazarbayev University Prep",
  "Data Science & Python",
  "Стартапы & Предпринимательство",
];

const KAZAKHSTAN_CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Атырау",
  "Костанай",
  "Кызылорда",
  "Уральск",
  "Петропавловск",
  "Другой город",
];

export default function RegisterPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("10 класс");
  const [city, setCity] = useState("Алматы");
  const [bio, setBio] = useState("");
  
  // Custom user interests tags
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Олимпиадная математика",
    "Machine Learning & AI",
  ]);
  const [customInterestInput, setCustomInterestInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInterestInput.trim();
    if (!trimmed) return;
    if (!selectedInterests.includes(trimmed)) {
      setSelectedInterests((prev) => [...prev, trimmed]);
    }
    setCustomInterestInput("");
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setSelectedInterests((prev) => prev.filter((i) => i !== interestToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (selectedInterests.length === 0) {
      setError("Пожалуйста, укажите хотя бы один интерес или сферу развития.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Explicitly pass interests JSON
    formData.set("interests", JSON.stringify(selectedInterests));

    const result = await signupAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl py-6">
      <div className="zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xl space-y-6">
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="flex justify-center mb-3">
            <WintalityIcon size={46} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Создать профиль Wintality
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Персональный AI трекер возможностей, скоринг портфолио и подготовка к поступлению в топ-вузы
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Full Name & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Имя и фамилия *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Жанибек Абубакиров"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Текущий класс / курс *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="7 класс">7 класс</option>
                  <option value="8 класс">8 класс</option>
                  <option value="9 класс">9 класс</option>
                  <option value="10 класс">10 класс</option>
                  <option value="11 класс">11 класс</option>
                  <option value="12 класс (НИШ/IB)">12 класс (НИШ / IB)</option>
                  <option value="Студент колледжа">Студент колледжа</option>
                  <option value="Студент вуза (1-2 курс)">Студент вуза (1–2 курс)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: City & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Город / Регион *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {KAZAKHSTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Электронная почта *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zhanibek@wintality.kz"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Short Bio / About Yourself */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Краткая информация о себе и целях *
              </label>
              <span className="text-[10px] text-zinc-400">Сохраняется в профиле</span>
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <textarea
                name="bio"
                required
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Например: Учусь в РФМШ, интересуюсь олимпиадами по математике и CS. Планирую поступать в Nazarbayev University на грант или топовые вузы США..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 4: Custom Interests Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Ваши интересы (выберите или введите свои):</span>
              </label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                {selectedInterests.length} выбрано
              </span>
            </div>

            {/* Currently Selected Interest Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
              {selectedInterests.length === 0 ? (
                <span className="text-[11px] text-zinc-400 italic">
                  Выберите ниже или введите свои теги...
                </span>
              ) : (
                selectedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="p-0.5 hover:bg-blue-500/20 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Custom Interest Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInterestInput}
                onChange={(e) => setCustomInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomInterest();
                  }
                }}
                placeholder="Свой интерес (нажмите Enter для добавления)..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomInterest()}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>

            {/* Popular Suggested Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider block">
                Популярные направления:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INTERESTS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleToggleInterest(tag)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700/60"
                      }`}
                    >
                      {tag} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 5: Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Пароль *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Зарегистрироваться и открыть Личный кабинет</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Уже зарегистрированы?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            {t.nav.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
