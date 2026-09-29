"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-900">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Logo size="md" showBadge={true} badgeText="EdTech" />
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Интеллектуальная EdTech-платформа и трекер возможностей для школьников и студентов. Автоматический подбор программ, олимпиад, летних школ и грантов с живым контролем дедлайнов.
            </p>
            <div className="text-[11px] text-zinc-500 font-mono">
              {siteConfig.tagline}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs tracking-wider uppercase">
              Платформа
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/opportunities" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Каталог возможностей
                </Link>
              </li>
              <li>
                <Link href="/opportunities?scope=kazakhstan" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Казахстанские программы 🇰🇿
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Личный Deadline Tracker
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Настройки профиля
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div className="space-y-2.5">
            <h4 className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs tracking-wider uppercase">
              Аккаунт
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Вход в систему
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Создать профиль
                </Link>
              </li>
              <li>
                <a href="mailto:support@wintality.kz" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Связаться с командой
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © 2026 Wintality. Все права защищены.
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs">
            <span className="text-[11px] text-zinc-500 font-medium mr-0.5">Вид & Язык:</span>
            <ThemeToggle />
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Политика конфиденциальности</span>
            <span>•</span>
            <span>Пользовательское соглашение</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
