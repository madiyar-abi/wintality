import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { siteConfig } from "@/config/site";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] antialiased bg-grid-subtle transition-colors">
      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>На главную</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>

      {/* Bottom Bar */}
      <div className="py-6 text-center text-xs text-zinc-500">
        © 2026 {siteConfig.name}. Единая платформа возможностей.
      </div>
    </div>
  );
}
