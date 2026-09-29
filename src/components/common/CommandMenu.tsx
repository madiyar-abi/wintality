"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/context";
import { allOpportunities } from "@/config/site";
import { 
  Search, 
  Sparkles, 
  Compass, 
  FileText, 
  Calendar, 
  UserCheck, 
  Sun, 
  Moon, 
  Laptop, 
  Globe, 
  ArrowRight,
  Bookmark,
  Award,
  Layers,
  FileCheck2,
  ExternalLink
} from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Toggle with keyboard shortcuts (Cmd+K, Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => setOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("open-command-menu", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", handleCustomOpen);
    };
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <Command.Input
            placeholder={
              language === "kz"
                ? "Мүмкіндіктерді, олимпиадаларды немесе бұйрықтарды іздеу... (Esc — жабу)"
                : language === "en"
                ? "Search programs, Olympiads, or actions... (Esc to close)"
                : "Поиск программ, олимпиад, действий... (Esc для закрытия)"
            }
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <Command.List className="max-h-[380px] overflow-y-auto p-2 text-xs space-y-1 scrollbar-thin">
          <Command.Empty className="py-8 text-center text-xs text-zinc-400">
            {language === "kz"
              ? "Ештеңе табылмады"
              : language === "en"
              ? "No results found."
              : "Ничего не найдено."}
          </Command.Empty>

          {/* Quick Navigation */}
          <Command.Group heading="Навигация и разделы" className="text-[11px] font-semibold text-zinc-400 px-2 py-1.5 uppercase font-mono">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/opportunities"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Каталог возможностей (Казахстан & Мир)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">/opportunities</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-emerald-500" />
                <span>Личный кабинет (Канбан-трекер дедлайнов)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">/dashboard</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard/mock-interview"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>AI Симулятор интервью в приемную комиссию</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">NEW</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard/resume"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-amber-500" />
                <span>Генератор академического CV (PDF Экспорт)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">PDF</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard/essay-checker"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>AI Аудит мотивационного эссе</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">/essay-checker</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard/roadmap"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>AI Персональный роадмап на учебный год</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">/roadmap</span>
            </Command.Item>
          </Command.Group>

          {/* Quick Actions */}
          <Command.Group heading="Быстрые действия" className="text-[11px] font-semibold text-zinc-400 px-2 py-1.5 uppercase font-mono">
            <Command.Item
              onSelect={() => runCommand(() => {
                window.open("/api/calendar/export", "_blank");
              })}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Скачать календарь всех дедлайнов (.ics)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">iCal / Apple / Outlook</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>Переключить тему оформления ({theme === "dark" ? "Светлая" : "Темная"})</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Theme</span>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => setLanguage(language === "ru" ? "kz" : language === "kz" ? "en" : "ru"))}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Сменить язык интерфейса (Текущий: {language.toUpperCase()})</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">KZ / RU / EN</span>
            </Command.Item>
          </Command.Group>

          {/* Top Opportunities Instant Search */}
          <Command.Group heading="Программы и олимпиады" className="text-[11px] font-semibold text-zinc-400 px-2 py-1.5 uppercase font-mono">
            {allOpportunities.slice(0, 15).map((opp) => (
              <Command.Item
                key={opp.id}
                onSelect={() => runCommand(() => router.push(`/opportunities/${opp.id}`))}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Award className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium">{opp.title}</span>
                    <span className="text-[11px] text-zinc-400 ml-2 font-normal">({opp.organizer})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {opp.scope === "kazakhstan" ? "🇰🇿 KZ" : "🌍 Global"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono">↑↓</kbd>
              <span>выбор</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono">↵</kbd>
              <span>перейти</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">Wintality Quick Access</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
