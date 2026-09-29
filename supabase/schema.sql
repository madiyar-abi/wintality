-- Wintality: Database Schema & Row Level Security (RLS)
-- Run this migration in your Supabase SQL Editor

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  grade TEXT DEFAULT '10 класс',
  interests TEXT[] DEFAULT ARRAY['Business & Economics', 'Computer Science']::TEXT[],
  target_country TEXT DEFAULT 'Казахстан / США',
  english_level TEXT DEFAULT 'B2',
  bio TEXT,
  resume_url TEXT,
  resume_filename TEXT,
  resume_size TEXT,
  resume_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('olympiad', 'mun', 'internship', 'scholarship', 'summer_school', 'hackathon', 'university')),
  category_label TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT '🌐',
  link TEXT NOT NULL,
  grade_min INT DEFAULT 8,
  grade_max INT DEFAULT 11,
  english_required TEXT DEFAULT 'B1',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  match_points TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. SAVED OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applying', 'applied')),
  deadline_notification BOOLEAN DEFAULT TRUE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, opportunity_id)
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Opportunities Policies (Public read)
CREATE POLICY "Opportunities are readable by everyone"
  ON public.opportunities FOR SELECT
  TO public
  USING (true);

-- Saved Opportunities Policies (Strictly user-specific)
CREATE POLICY "Users can view their own saved opportunities"
  ON public.saved_opportunities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities"
  ON public.saved_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved opportunities status"
  ON public.saved_opportunities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved opportunities"
  ON public.saved_opportunities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. AUTOMATIC PROFILE TRIGGER ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, grade, english_level)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Студент Wintality'),
    COALESCE(new.raw_user_meta_data->>'grade', '10 класс'),
    COALESCE(new.raw_user_meta_data->>'english_level', 'B2')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. SEED DATA (Curated Opportunities)
INSERT INTO public.opportunities (
  id, title, category, category_label, organizer, description, deadline, 
  location, country, flag, link, grade_min, grade_max, english_required, tags, requirements, match_points, is_featured
) VALUES
(
  'harvard-summer-school',
  'Harvard Secondary School Program (SSP)',
  'summer_school',
  'Летняя школа',
  'Harvard University',
  'Интенсивная 7-недельная академическая программа в кампусе Гарварда или онлайн. Старшеклассники берут университетские курсы с получением кредитов колледжа.',
  NOW() + INTERVAL '34 days',
  'Кембридж, Массачусетс / Онлайн',
  'США',
  '🇺🇸',
  'https://summer.harvard.edu/high-school-programs/secondary-school-program/',
  10, 11, 'B2',
  ARRAY['Ivy League', 'Академические кредиты', 'Leadership', 'Экономика & CS']::TEXT[],
  ARRAY['Транскрипт оценок (GPA от 3.5)', 'Мотивационное эссе', 'Рекомендательное письмо преподавателя']::TEXT[],
  ARRAY['Подходит по возрасту (15–18 лет)', 'Требуемый уровень английского B2+', 'Сильный интерес к академическим исследованиям']::TEXT[],
  true
),
(
  'wharton-investment-comp',
  'Wharton Global High School Investment Competition',
  'olympiad',
  'Бизнес-олимпиада',
  'Wharton School, University of Pennsylvania',
  'Престижнейший международный командный турнир по инвестициям и управлению портфелем ценных бумаг для школьников 9–11 классов.',
  NOW() + INTERVAL '14 days',
  'Финал в Филадельфии / Онлайн раунд',
  'Global',
  '🏆',
  'https://globalyouth.wharton.upenn.edu/competitions/investment-competition/',
  9, 11, 'B2',
  ARRAY['Финансы', 'Инвестиции', 'Командный кейс', 'FinTech']::TEXT[],
  ARRAY['Команда 4–7 школьников', 'Инвестиционный отчет и стратегия', 'Видео-презентация']::TEXT[],
  ARRAY['Идеально для интересов в Business & Economics', 'Развивает аналитическое мышление', 'Командное соревнование']::TEXT[],
  true
),
(
  'harvard-mun-asia',
  'Harvard Model United Nations (HMUN)',
  'mun',
  'MUN Конференция',
  'Harvard International Relations Council',
  'Крупнейшая симуляция Генеральной Ассамблеи ООН, где школьники выступают в роли делегатов мировых держав и решают геополитические и экономические кризисы.',
  NOW() + INTERVAL '7 days',
  'Токио / Бостон',
  'Global',
  '🌎',
  'https://www.harvardmun.org/',
  8, 11, 'B2',
  ARRAY['Дебаты', 'Международные отношения', 'Дипломатия', 'English C1']::TEXT[],
  ARRAY['Position Paper по комитету', 'Регистрация делегации', 'Владение процедурой ROP']::TEXT[],
  ARRAY['Высокая точность матчинга для любителей дебатов', 'Сертификат Гарвардского совета', 'Практика переговоров']::TEXT[],
  true
),
(
  'flex-scholarship',
  'Future Leaders Exchange (FLEX Program)',
  'scholarship',
  'Стипендиальная программа',
  'U.S. Department of State / American Councils',
  'Полная правительственная стипендия на 1 академический год проживания и обучения в американской старшей школе в принимающей семье.',
  NOW() + INTERVAL '24 days',
  'Казахстан → США',
  'США',
  '💰',
  'https://www.discoverflex.org/',
  9, 10, 'B1',
  ARRAY['Полное финансирование', 'Обмен', 'Лидерство', 'Культурный обмен']::TEXT[],
  ARRAY['Гражданство Казахстана', 'Возраст 15–17 лет', '3 тура отбора: тест, эссе, собеседование']::TEXT[],
  ARRAY['100% покрытие перелета, школы и проживания', 'Развивает независимость и язык']::TEXT[],
  true
),
(
  'tinkoff-internship-juniors',
  'Tinkoff Generation & Финтех Стажировка',
  'internship',
  'Стажировка',
  'Tinkoff & Партнеры',
  'Практическая стажировка в продуктовых командах разработки, мобильных приложениях и финтех-сервисах для старшеклассников с техническим бэкграундом.',
  NOW() + INTERVAL '19 days',
  'Удаленно / Алматы Hub',
  'Казахстан',
  '⚡️',
  'https://fintech.tinkoff.ru/activities/schoolkids/',
  9, 11, 'B1',
  ARRAY['FinTech', 'Frontend / Backend', 'Python & TypeScript', 'Портфолио']::TEXT[],
  ARRAY['Решение вступительного контеста', 'Техническое интервью', 'Pet-проект на GitHub']::TEXT[],
  ARRAY['Оплачиваемый опыт работы в реальном финтехе', 'Оффер в команду по итогам']::TEXT[],
  false
),
(
  'stanford-summer-humanities',
  'Stanford Pre-Collegiate Summer Institutes',
  'university',
  'Университетская программа',
  'Stanford University',
  'Трехнедельные интенсивные семинары со стэнфордскими профессорами по передовым темам: искусственный интеллект, философия, биоинженерия.',
  NOW() + INTERVAL '45 days',
  'Стэнфорд, Калифорния',
  'США',
  '🎓',
  'https://spcs.stanford.edu/programs/stanford-pre-collegiate-summer-institutes',
  9, 11, 'B2',
  ARRAY['Stanford', 'Исследования', 'AI & Philosophy', 'Нетворкинг']::TEXT[],
  ARRAY['Academic Transcript', 'Эссе с анализом проблемы', 'Work Sample']::TEXT[],
  ARRAY['Преподавание действующими профессорами Stanford', 'Доступ к университетской библиотеке']::TEXT[],
  false
)
ON CONFLICT (id) DO NOTHING;
