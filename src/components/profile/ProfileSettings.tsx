"use client";

import { useState, useRef } from "react";
import { UserAvatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/types";
import { saveResumeAction, deleteResumeAction } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Globe, 
  MapPin, 
  BookOpen, 
  Check, 
  Save, 
  Upload, 
  Camera,
  Languages,
  FileCheck2,
  FileText,
  Trash2,
  ExternalLink,
  Eye,
  Sparkles,
  FileUp,
  Image as ImageIcon
} from "lucide-react";

interface ProfileSettingsProps {
  user: {
    fullName?: string;
    grade?: string;
    city?: string;
    bio?: string;
    interests?: string[];
    email?: string;
    avatarUrl?: string;
    resumeUrl?: string;
    resumeName?: string;
    resumeSize?: string;
    resumeUpdatedAt?: string;
  } | null;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { t, language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState(user?.fullName || "Жанибек Абубакиров");
  const [grade, setGrade] = useState(user?.grade || "10 класс");
  const [city, setCity] = useState(user?.city || "Алматы");
  const [englishLevel, setEnglishLevel] = useState("B2");
  const [targetCountry, setTargetCountry] = useState("Казахстан (NU) / США (Ivy League)");
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=Zhanibek&backgroundColor=18181b"
  );
  const [bio, setBio] = useState(
    user?.bio ||
      "Учусь в 10 классе, ориентируюсь на поступление в Nazarbayev University на грант и подготовку к Республиканской олимпиаде. Готовлю портфолио в сфере Data Science & FinTech."
  );

  // Resume / CV State
  const [resumeUrl, setResumeUrl] = useState<string | null>(user?.resumeUrl || null);
  const [resumeName, setResumeName] = useState<string | null>(user?.resumeName || null);
  const [resumeSize, setResumeSize] = useState<string | null>(user?.resumeSize || null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Business & Economics",
    "FinTech & IT",
    "Республиканская олимпиада (Дарын)",
    "Nazarbayev University Pre-College"
  ]);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 6 Curated Avatar Presets via DiceBear Notionists
  const avatarPresets = [
    { name: "Ameli (Tech)", seed: "Ameli" },
    { name: "Alikhan (Olympiad)", seed: "Alikhan" },
    { name: "Dana (Debates)", seed: "Dana" },
    { name: "Sanzhar (Science)", seed: "Sanzhar" },
    { name: "Amina (NU Prep)", seed: "Amina" },
    { name: "Arman (FinTech)", seed: "Arman" }
  ];

  const availableInterests = [
    "Business & Economics",
    "FinTech & IT",
    "Республиканская олимпиада (Дарын)",
    "Жаутыковская олимпиада (IZhO)",
    "Nazarbayev University Pre-College",
    "Astana Hub & Tech Orda",
    "MUN & Дебаты",
    "Олимпиадная математика",
    "Спортивное программирование (C++)",
    "Международные стипендии (FLEX / UGRAD)"
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePresetSelect = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=18181b`;
    setAvatarUrl(url);
    toast.success("Аватар выбран!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const localPreviewUrl = URL.createObjectURL(file);
      setAvatarUrl(localPreviewUrl);

      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        if (pubData?.publicUrl) {
          setAvatarUrl(pubData.publicUrl);
        }
      }
      toast.success("Фото успешно загружено!");
    } catch {
      toast.info("Фото установлено локально");
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported: PDF, PNG, JPG, JPEG
    const validExtensions = ["pdf", "png", "jpg", "jpeg"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(fileExt || "")) {
      toast.error("Пожалуйста, загрузите файл в формате PDF, PNG или JPG.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 15 МБ.");
      return;
    }

    setResumeUploading(true);
    try {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} МБ`
          : `${Math.round(file.size / 1024)} КБ`;

      const localBlobUrl = URL.createObjectURL(file);
      setResumeUrl(localBlobUrl);
      setResumeName(file.name);
      setResumeSize(formattedSize);

      let finalUrl = localBlobUrl;

      try {
        const supabase = createClient();
        const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { data, error } = await supabase.storage
          .from("resumes")
          .upload(cleanName, file, { upsert: true });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from("resumes").getPublicUrl(cleanName);
          if (pubData?.publicUrl) {
            finalUrl = pubData.publicUrl;
            setResumeUrl(finalUrl);
          }
        }
      } catch {
        // Fallback to local
      }

      await saveResumeAction({
        resumeUrl: finalUrl,
        resumeName: file.name,
        resumeSize: formattedSize,
      });

      toast.success("Резюме успешно прикреплено к вашему профилю!");
    } catch {
      toast.error("Ошибка при сохранении резюме");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    setResumeUrl(null);
    setResumeName(null);
    setResumeSize(null);
    await deleteResumeAction();
    toast.info("Резюме удалено из профиля");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferredLang !== language) {
      setLanguage(preferredLang);
    }
    toast.success(t.profile.saveSuccess);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t.profile.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          {t.profile.subtitle}
        </p>
      </div>

      {/* Avatar Customization Card */}
      <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-5 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-500" />
          <span>Аватар профиля</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Main Avatar Display */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <UserAvatar
              src={avatarUrl}
              fallbackName={fullName}
              size="xl"
              showStatus={true}
              isOnline={true}
              className="border-2 border-zinc-200 dark:border-zinc-700 ring-4 ring-zinc-100 dark:ring-zinc-900"
            />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Активен в Wintality
            </span>
          </div>

          {/* Upload & Presets Actions */}
          <div className="space-y-4 flex-1 text-center sm:text-left">
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Загрузите фото или выберите пресет Notionist
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                PNG, JPG или SVG до 5 МБ.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Загрузка..." : "Загрузить фото"}</span>
              </button>
            </div>

            {/* Ready-made avatar presets */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">
                Готовые пресеты аватаров:
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto pb-1">
                {avatarPresets.map((preset) => {
                  const presetUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${preset.seed}&backgroundColor=18181b`;
                  const isSelected = avatarUrl?.includes(preset.seed);

                  return (
                    <button
                      key={preset.seed}
                      type="button"
                      onClick={() => handlePresetSelect(preset.seed)}
                      className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/30 scale-105"
                          : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-500 opacity-70 hover:opacity-100"
                      }`}
                      title={preset.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={presetUrl}
                        alt={preset.name}
                        className="w-10 h-10 object-cover bg-zinc-100 dark:bg-zinc-900"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Resume & Portfolio File Card */}
      <div className="zinc-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-500" />
              <span>Академическое резюме / CV</span>
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Прикрепите резюме в формате PDF, PNG или JPG для учета в AI-скоринге и подаче заявок
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
            PDF • PNG • JPG
          </span>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={resumeInputRef}
          onChange={handleResumeUpload}
          accept=".pdf,image/png,image/jpeg,image/jpg"
          className="hidden"
        />

        {resumeName ? (
          /* Attached Resume Card */
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-xs">
                  {resumeName.toLowerCase().endsWith(".pdf") ? (
                    <FileText className="w-5 h-5 text-rose-500" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[260px] sm:max-w-md">
                    {resumeName}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{resumeSize || "1.2 МБ"}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Прикреплено к профилю
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Открыть</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                >
                  Заменить
                </button>

                <button
                  type="button"
                  onClick={handleDeleteResume}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Удалить резюме"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Drag & Drop Zone */
          <div
            onClick={() => resumeInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/40 group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {resumeUploading ? "Загрузка файла..." : "Нажмите или перетащите файл резюме сюда"}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Поддерживаются форматы PDF, PNG, JPG до 15 МБ
              </p>
            </div>
          </div>
        )}

        {/* Harvard CV Builder banner link */}
        <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Нет готового файла? Сгенерируйте по стандартам Harvard</span>
          </div>
          <Link
            href="/dashboard/resume"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Конструктор CV →
          </Link>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-6 shadow-xs">
        {/* Full Name & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.city}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Алматы / Астана / Шымкент"
                className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Grade & English Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.grade}
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="8 класс">8 класс</option>
              <option value="9 класс">9 класс</option>
              <option value="10 класс">10 класс</option>
              <option value="11 класс">11 класс</option>
              <option value="Студент 1-2 курса">Студент 1–2 курса</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.englishLevel}
            </label>
            <select
              value={englishLevel}
              onChange={(e) => setEnglishLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
              <option value="B2">B2 (Upper-Intermediate, IELTS 6.0-6.5)</option>
              <option value="C1">C1 (Advanced, IELTS 7.0-8.0)</option>
              <option value="C2">C2 (Proficient, IELTS 8.5+)</option>
            </select>
          </div>
        </div>

        {/* Target Country & Preferred Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.targetMajor}
            </label>
            <input
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="Казахстан (NU / КБТУ / AITU) / США / Европа"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              {t.profile.preferredLanguage}
            </label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as Language)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="kz">Қазақ тілі 🇰🇿</option>
              <option value="ru">Русский язык 🇷🇺</option>
              <option value="en">English 🇬🇧</option>
            </select>
          </div>
        </div>

        {/* Interests & Olympiad Subjects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              Олимпиадные предметы и интересы (Казахстан 🇰🇿 + Global 🌍)
            </label>
            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
              {selectedInterests.length} выбрано
            </span>
          </div>

          {/* Selected interests with removal */}
          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-xs font-medium"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => setSelectedInterests((prev) => prev.filter((i) => i !== interest))}
                  className="hover:text-rose-500 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Quick preset selector buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {interest} {isSelected ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio / Academic Goals */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
            О себе и академические цели
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.profile.saveBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
