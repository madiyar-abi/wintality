"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { UserAvatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/app/actions/auth";
import { useLanguage } from "@/lib/i18n/context";
import { 
  Compass, 
  BookOpen, 
  User, 
  LogOut, 
  FileText, 
  Map,
  UserCheck,
  FileCheck2,
  Search,
  Sparkles,
  ChevronDown,
  Settings
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface DashboardHeaderProps {
  user: {
    email?: string;
    fullName?: string;
    grade?: string;
    avatarUrl?: string;
    city?: string;
    isDemo?: boolean;
  } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const aiMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or route change
  useEffect(() => {
    setAiMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setAiMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAiMenuOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Primary navigation links
  const isAiActive = 
    pathname.startsWith("/dashboard/mock-interview") ||
    pathname.startsWith("/dashboard/essay-checker") ||
    pathname.startsWith("/dashboard/roadmap");

  const aiSubLinks = [
    {
      title: "AI Симулятор интервью",
      href: "/dashboard/mock-interview",
      desc: "5 раундов вопросов приемной комиссии",
      icon: UserCheck,
      badge: "NEW",
    },
    {
      title: "AI Проверка эссе",
      href: "/dashboard/essay-checker",
      desc: "Аудит мотивационных писем на гранты",
      icon: FileText,
      badge: "AI",
    },
    {
      title: "AI Дорожная карта",
      href: "/dashboard/roadmap",
      desc: "Пошаговый план олимпиад и дедлайнов",
      icon: Map,
      badge: "AI",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand & Ergonomic Clean Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Logo href="/" size="md" showBadge={false} />

          {/* Desktop Navigation: 4 clean items */}
          <nav className="hidden md:flex items-center gap-1">
            {/* 1. Tracker */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`} />
              <span>Трекер</span>
            </Link>

            {/* 2. Catalog */}
            <Link
              href="/opportunities"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith("/opportunities")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${pathname.startsWith("/opportunities") ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`} />
              <span>Каталог</span>
            </Link>

            {/* 3. Resume / CV */}
            <Link
              href="/dashboard/resume"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === "/dashboard/resume"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <FileCheck2 className={`w-3.5 h-3.5 ${pathname === "/dashboard/resume" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`} />
              <span>Резюме</span>
            </Link>

            {/* 4. AI Services Dropdown */}
            <div className="relative" ref={aiMenuRef}>
              <button
                type="button"
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isAiActive || aiMenuOpen
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiActive ? "text-blue-600 dark:text-blue-400" : "text-blue-500"}`} />
                <span>ИИ-Сервисы</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${aiMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* AI Dropdown Menu */}
              {aiMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Интеллектуальные инструменты
                  </div>
                  <div className="space-y-1 mt-1">
                    {aiSubLinks.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setAiMenuOpen(false)}
                          className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${
                            isActive
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold leading-tight">{item.title}</span>
                              {item.badge && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5 line-clamp-1">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Controls & Streamlined User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Cmd+K Search Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Быстрый поиск (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">⌘K</kbd>
          </button>

          <LanguageSwitcher />
          <ThemeToggle />

          {/* User Menu Avatar Trigger */}
          <div className="relative pl-1.5 border-l border-zinc-200 dark:border-zinc-800" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
              title="Меню профиля"
            >
              <UserAvatar
                src={user?.avatarUrl}
                fallbackName={user?.fullName || "Жанибек Абубакиров"}
                size="sm"
                showStatus={true}
                isOnline={true}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* User Dropdown Card */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* User Summary Card */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-1 border border-zinc-100 dark:border-zinc-800">
                  <UserAvatar
                    src={user?.avatarUrl}
                    fallbackName={user?.fullName || "Жанибек Абубакиров"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {user?.fullName || "Жанибек Абубакиров"}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {user?.grade || "10 класс"} • {user?.city ? `г. ${user.city}` : "г. Алматы"}
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Мой профиль</span>
                  </Link>

                  <Link
                    href="/dashboard/resume"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4 text-zinc-400" />
                    <span>Мое резюме (CV)</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Настройки аккаунта</span>
                  </Link>

                  <div className="my-1 border-t border-zinc-200 dark:border-zinc-800/80" />

                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-header navigation on mobile and tablet */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 overflow-x-auto scrollbar-none">
        <Link
          href="/dashboard"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Трекер</span>
        </Link>
        <Link
          href="/opportunities"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname.startsWith("/opportunities")
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Каталог</span>
        </Link>
        <Link
          href="/dashboard/resume"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/dashboard/resume"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Резюме</span>
        </Link>
        <Link
          href="/dashboard/mock-interview"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/dashboard/mock-interview"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Интервью</span>
        </Link>
        <Link
          href="/dashboard/essay-checker"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/dashboard/essay-checker"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Эссе</span>
        </Link>
        <Link
          href="/dashboard/roadmap"
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/dashboard/roadmap"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Роадмап</span>
        </Link>
      </div>
    </header>
  );
}
