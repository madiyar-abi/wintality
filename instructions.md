# Project Instructions: Wintality Website

## 1. Общие сведения и контекст проекта
- **Название проекта**: Wintality.
- **Источник данных**: Вся текстовая база, смысловые блоки и правила проекта берутся **исключительно** из директории `main info/`:
  - `main info/name.md` — название, брендинг, tone of voice.
  - `main info/about.md` — информация о проекте, миссия, ценности.
  - `main info/exception.md` — исключения, особые условия, регламентные ограничения.
  - `main info/положение/` — официальное положение/документы (при необходимости структурировать в читаемый веб-формат с возможностью скачивания или модального просмотра).
  - Графика и логотипы: брать из `main info/` и оптимизировать через `next/image`.

---

## 2. Стек технологий
- **Фреймворк**: Next.js 14+ (App Router, Server Components по умолчанию).
- **Язык**: TypeScript (строгая типизация, без `any`).
- **Стилизация**: Tailwind CSS.
- **UI-компоненты**: shadcn/ui (Radix UI) + Lucide Icons.
- **Анимации**: Framer Motion / Tailwind Animate (плавные, аккуратные микровзаимодействия).
- **Шрифты**: `next/font` (современный гротеск: Inter, Plus Jakarta Sans или Geist).

---

## 3. Архитектура и структура папок
Соблюдать чистую структуру:
```text
wintality/
├── main info/              # Исходные материалы и документы
├── public/                 # Статические ассеты (иконки, изображения)
├── src/
│   ├── app/                # App Router (layout.tsx, page.tsx, error.tsx)
│   ├── components/
│   │   ├── ui/             # Базовые UI-компоненты (shadcn)
│   │   ├── layout/         # Header, Footer, Navigation, Container
│   │   └── sections/       # Блоки страниц (Hero, About, Rules, FAQ и т.д.)
│   ├── lib/                # Утилиты (cn, форматирование, парсеры)
│   ├── types/              # TypeScript интерфейсы и типы
│   └── config/             # Конфигурация сайта, метаданные, навигация
└── instructions.md         # Данный файл инструкций