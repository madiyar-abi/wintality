"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { UserAvatar } from "@/components/ui/Avatar";
import { Menu, X, ArrowRight, Compass, Sparkles, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/ui/Logo";

interface PublicHeaderProps {
  user?: { email?: string; fullName?: string; avatarUrl?: string } | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = user
    ? [
        { label: t.nav.catalog, href: "/opportunities" },
        { label: t.nav.dashboard, href: "/dashboard" },
        { label: t.nav.aiTools, href: "/#features" },
        { label: t.nav.about, href: "/#about" },
      ]
    : [
        { label: t.nav.about, href: "/#about" },
        { label: t.nav.aiTools, href: "/#features" },
        { label: "Как это работает", href: "/#how-it-works" },
        { label: "Тарифы", href: "/#pricing" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Logo href="/" size="md" showBadge={true} badgeText="EdTech" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
            className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Быстрый поиск (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">Поиск...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">⌘K</kbd>
          </button>
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              <UserAvatar
                src={user?.avatarUrl}
                fallbackName={user?.fullName || "Ameli"}
                size="sm"
                showStatus={true}
                isOnline={true}
              />
              <span>{t.nav.dashboard}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-3 py-2 transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>{t.nav.register}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60"
            aria-label="Меню"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-5 space-y-4">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold"
              >
                <Compass className="w-4 h-4" />
                <span>{t.nav.dashboard} ({user.fullName || "Ameli"})</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-medium"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-semibold"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
