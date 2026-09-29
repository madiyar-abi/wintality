import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wintality.kz"),
  title: {
    default: "Wintality — Платформа возможностей и AI трекер дедлайнов",
    template: "%s | Wintality"
  },
  description: "Единый EdTech-навигатор олимпиад, грантов, стажировок и программ в Казахстане и мире. Умный скоринг профиля и персональный Deadline Tracker.",
  keywords: [
    "Wintality",
    "возможности для школьников",
    "олимпиады Казахстан",
    "Дарын",
    "Nazarbayev University",
    "Astana Hub",
    "летние школы",
    "MUN",
    "гранты",
    "deadline tracker"
  ],
  authors: [{ name: "Wintality Team" }],
  openGraph: {
    title: "Wintality — Единая платформа возможностей и AI трекер дедлайнов",
    description: "AI собирает проверенные олимпиады, гранты и стажировки, анализирует профиль ученика и выстраивает персональную траекторию побед.",
    url: "https://wintality.kz",
    siteName: "Wintality",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wintality — Единая платформа возможностей и AI трекер дедлайнов",
    description: "Win + Fatality: персональный AI-навигатор олимпиад, грантов и стажировок.",
  },
  robots: {
    index: true,
    follow: true
  },
  manifest: "/manifest.json"
};

import { CommandMenu } from "@/components/common/CommandMenu";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-blue-500/25 selection:text-blue-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <CommandMenu />
            <Toaster position="top-right" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
