"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, TranslationDictionary } from "./types";
import { dictionaries } from "./dictionaries";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "ru",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // Check localStorage
    const saved = localStorage.getItem("wintality_lang") as Language | null;
    if (saved && (saved === "kz" || saved === "ru" || saved === "en")) {
      setLanguageState(saved);
      document.documentElement.lang = saved === "kz" ? "kk" : saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("wintality_lang", lang);
    document.cookie = `wintality_lang=${lang}; path=/; max-age=31536000`;
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
  };

  const t = useMemo(() => {
    return dictionaries[language] || dictionaries.ru;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback outside provider
    return {
      language: "ru" as Language,
      setLanguage: () => {},
      t: dictionaries.ru,
    };
  }
  return context;
}
