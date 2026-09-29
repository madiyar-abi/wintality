"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/types";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages: { code: Language; label: string; flag: string; short: string }[] = [
  { code: "kz", label: "Қазақша", flag: "🇰🇿", short: "KZ" },
  { code: "ru", label: "Русский", flag: "🇷🇺", short: "RU" },
  { code: "en", label: "English", flag: "🇬🇧", short: "EN" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === language) || languages[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        title="Сменить язык / Тіл таңдау / Change language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="font-mono text-[11px]">{current.short}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                language === lang.code
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-blue-600 dark:text-blue-400 font-bold"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">{lang.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
