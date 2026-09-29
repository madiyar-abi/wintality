"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-center opacity-70">
        <Sun className="w-3.5 h-3.5 text-zinc-400" />
      </div>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Тема: ${theme === "dark" ? "Темная" : theme === "light" ? "Светлая" : "Системная"} (кликните для смены)`}
      aria-label="Сменить тему оформления"
      className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-amber-400" />
      ) : theme === "light" ? (
        <Moon className="w-3.5 h-3.5 text-blue-600" />
      ) : (
        <Laptop className="w-3.5 h-3.5 text-zinc-400" />
      )}
    </button>
  );
}
