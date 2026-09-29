-- Migration: 02_opportunities_tracking.sql
-- Description: Opportunities catalog with user tracking, automatic popularity counter triggers, and RLS

-- 1. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('olympiad', 'mun', 'grant', 'incubator', 'summer_school', 'internship')),
  region TEXT NOT NULL CHECK (region IN ('kz', 'international')),
  city TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  target_grades INT[] DEFAULT ARRAY[8, 9, 10, 11]::INT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT NOT NULL,
  requirements TEXT,
  link TEXT NOT NULL,
  interested_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. USER OPPORTUNITIES TABLE (Tracked & Favorite Applications)
CREATE TABLE IF NOT EXISTS public.user_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'preparing', 'applied', 'result_received')),
  is_favorite BOOLEAN DEFAULT TRUE,
  personal_notes TEXT,
  deadline_reminder BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT user_opportunities_unique UNIQUE (user_id, opportunity_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_region ON public.opportunities(region);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline ASC);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_user_id ON public.user_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_status ON public.user_opportunities(status);

-- 3. AUTOMATIC TRIGGER FOR interested_count
CREATE OR REPLACE FUNCTION public.update_opportunity_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.opportunities
    SET interested_count = interested_count + 1
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.opportunities
    SET interested_count = GREATEST(interested_count - 1, 0)
    WHERE id = OLD.opportunity_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_opportunity_interested_count ON public.user_opportunities;

CREATE TRIGGER trg_user_opportunity_interested_count
AFTER INSERT OR DELETE ON public.user_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_opportunity_interested_count();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_opportunities ENABLE ROW LEVEL SECURITY;

-- Opportunities Policies (Public read)
DROP POLICY IF EXISTS "Allow public read on opportunities" ON public.opportunities;
CREATE POLICY "Allow public read on opportunities"
  ON public.opportunities FOR SELECT
  TO public
  USING (true);

-- User Opportunities Policies (User isolated)
DROP POLICY IF EXISTS "Allow users to read their own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Allow users to read their own tracked opportunities"
  ON public.user_opportunities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Allow users to insert their own tracked opportunities"
  ON public.user_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Allow users to update their own tracked opportunities"
  ON public.user_opportunities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Allow users to delete their own tracked opportunities"
  ON public.user_opportunities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. SEED DATA WITH VERIFIED KAZAKHSTAN & INTERNATIONAL OPPORTUNITIES
INSERT INTO public.opportunities (
  id, title, organization, category, region, city, deadline, target_grades, 
  tags, description, requirements, link, interested_count, views_count
) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Nazarbayev University Pre-College Summer Research',
  'Nazarbayev University (NU)',
  'summer_school',
  'kz',
  'Астана',
  NOW() + INTERVAL '42 days',
  ARRAY[10, 11]::INT[],
  ARRAY['STEM', 'Research', 'AI & Lab', 'IELTS 6.0+']::TEXT[],
  'Интенсивная летняя программа в кампусе Назарбаев Университета. Школьники работают в лабораториях с профессорами NU над исследовательскими проектами в области STEM и AI.',
  'Табель успеваемости (GPA не ниже 4.5/5.0), сертификат IELTS (не менее 6.0) или Duolingo, мотивационное эссе о научном интересе.',
  'https://nu.edu.kz/',
  248,
  1420
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Республиканская олимпиада школьников («Дарын»)',
  'РНПЦ «Дарын» Минпросвещения РК',
  'olympiad',
  'kz',
  'Онлайн (РК)',
  NOW() + INTERVAL '22 days',
  ARRAY[8, 9, 10, 11]::INT[],
  ARRAY['Госгрант РК', 'Дарын', 'БВИ в вузы', 'Национальная сборная']::TEXT[],
  'Главное академическое соревнование страны по 16 общеобразовательным предметам. Победители получают гарантированные гранты в вузы Казахстана и путевку в нацсборную.',
  'Официальная регистрация через школу на районный этап, победа на школьном/районном отборочном туре.',
  'https://daryn.kz/',
  580,
  3150
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Международная Жаутыковская олимпиада (IZhO)',
  'РФМШ & Оргкомитет IZhO',
  'olympiad',
  'kz',
  'Алматы',
  NOW() + INTERVAL '73 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['РФМШ', 'IZhO', 'Спортивное программирование', 'Высшая математика']::TEXT[],
  'Легендарная олимпиада по математике, физике и информатике для команд специализированных школ из 25+ стран мира. Высочайший мировой уровень задач.',
  'Командная заявка от специализированной школы или лицея, знание английского для чтения олимпиадных условий.',
  'https://izho.kz/',
  312,
  1890
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Astana Hub & Программа Tech Orda (Ваучеры на IT)',
  'Astana Hub & МЦРИАП РК',
  'grant',
  'kz',
  'Онлайн (РК)',
  NOW() + INTERVAL '32 days',
  ARRAY[11]::INT[],
  ARRAY['Tech Orda', 'Astana Hub', 'Грант 600 000 ₸', 'IT-карьера']::TEXT[],
  'Государственные ваучеры на бесплатное обучение передовым IT-специальностям (Web Development, Data Science, AI, GameDev) с последующим трудоустройством.',
  'Гражданство Республики Казахстан (возраст от 16 лет), прохождение вступительного тестирования школы.',
  'https://astanahub.com/',
  415,
  2450
),
(
  'a1000000-0000-0000-0000-000000000005',
  'nFactorial Incubator — Запуск мобильного приложения',
  'nFactorial School',
  'incubator',
  'kz',
  'Алматы',
  NOW() + INTERVAL '85 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Стартап', 'App Store', 'Mobile Dev', 'Demo Day']::TEXT[],
  'Летний интенсив по разработке и запуску собственного IT-продукта в App Store / Google Play. Выпускники презентуют приложения инвесторам на Demo Day.',
  'Базовые навыки программирования (любой язык), решение тестового задания, видео-визитка с идеей приложения.',
  'https://nfactorial.school/',
  195,
  1280
),
(
  'a1000000-0000-0000-0000-000000000006',
  'Wharton Global High School Investment Competition',
  'Wharton School, University of Pennsylvania',
  'olympiad',
  'international',
  'Global',
  NOW() + INTERVAL '14 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Финансы', 'Инвестиции', 'Командный кейс', 'FinTech']::TEXT[],
  'Международный командный турнир по финансовому анализу, инвестиционным стратегиям и управлению портфелем ценных бумаг для школьников 9–11 классов.',
  'Команда из 4–7 школьников под руководством советника/учителя, аналитический отчет по стратегии портфеля.',
  'https://globalyouth.wharton.upenn.edu/competitions/investment-competition/',
  340,
  2100
),
(
  'a1000000-0000-0000-0000-000000000007',
  'Harvard Secondary School Program (SSP)',
  'Harvard University',
  'summer_school',
  'international',
  'Global',
  NOW() + INTERVAL '34 days',
  ARRAY[10, 11]::INT[],
  ARRAY['Ivy League', 'Академические кредиты', 'Leadership', 'English B2+']::TEXT[],
  '7-недельная академическая программа в кампусе Гарварда или онлайн. Старшеклассники изучают университетские курсы с получением кредитов колледжа.',
  'Транскрипт оценок (GPA от 3.5), мотивационное эссе, рекомендательное письмо преподавателя, сертификат английского.',
  'https://summer.harvard.edu/high-school-programs/secondary-school-program/',
  480,
  3400
),
(
  'a1000000-0000-0000-0000-000000000008',
  'Future Leaders Exchange (FLEX Program)',
  'U.S. Department of State / American Councils',
  'grant',
  'international',
  'СНГ',
  NOW() + INTERVAL '24 days',
  ARRAY[9, 10]::INT[],
  ARRAY['100% Грант', 'Обмен', 'Лидерство', 'Культурный обмен']::TEXT[],
  'Полная стипендия на 1 академический год учебы в старшей школе США с проживанием в американской семье. 100% покрытие всех расходов.',
  'Гражданство Казахстана и соответствие возрастным рамкам (15–17 лет), успешное прохождение 3 туров.',
  'https://www.discoverflex.org/',
  620,
  4500
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  deadline = EXCLUDED.deadline,
  interested_count = EXCLUDED.interested_count;
