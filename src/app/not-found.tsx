import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo href="/" size="lg" showBadge={false} />
        </div>

        <div className="space-y-2">
          <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Страница не найдена
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Запрошенная страница не существует или была перемещена. Перейдите на главную страницу или в персональный кабинет.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>На главную</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Личный кабинет</span>
          </Link>
        </div>

        <div className="pt-4 text-xs text-zinc-400 dark:text-zinc-500">
          Или нажмите <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">⌘K</kbd> для быстрого поиска
        </div>
      </div>
    </div>
  );
}
