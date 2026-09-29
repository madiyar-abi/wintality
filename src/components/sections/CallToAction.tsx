import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="zinc-card p-8 sm:p-12 rounded-3xl border border-zinc-800 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Готовы построить портфолио для поступления в топ-вузы?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Создайте профиль за 2 минуты, добавьте первые программы в свой трекер и не упустите ни одного дедлайна этого года.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-sm transition-all shadow-sm"
            >
              <span>Создать бесплатный аккаунт</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/opportunities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-sm transition-colors"
            >
              <span>Исследовать программы</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
