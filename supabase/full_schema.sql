-- =====================================================================
-- WINTALITY — Full Supabase Database Schema & Production Seed
-- Migration: supabase/full_schema.sql
-- Supports: Profiles, Multi-language Opportunities, User Tracking Kanban,
-- AI Gap Analysis, AI Essay Reviews, Real-time counters & Row Level Security
-- =====================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Студент Wintality',
  avatar_url TEXT,
  city TEXT DEFAULT 'Алматы',
  grade TEXT DEFAULT '10 класс',
  school_name TEXT DEFAULT 'РФМШ / НИШ',
  target_major TEXT DEFAULT 'Computer Science & AI',
  english_level TEXT DEFAULT 'B2',
  olympiad_experience TEXT[] DEFAULT ARRAY['Республиканская олимпиада (Дарын)', 'IZhO']::TEXT[],
  preferred_language TEXT DEFAULT 'ru' CHECK (preferred_language IN ('kz', 'ru', 'en')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. OPPORTUNITIES TABLE (Multi-language Catalog)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL, -- {"kz": "...", "ru": "...", "en": "..."}
  organization TEXT NOT NULL,
  description JSONB NOT NULL, -- {"kz": "...", "ru": "...", "en": "..."}
  category TEXT NOT NULL CHECK (category IN ('olympiad', 'grant', 'summer_program', 'hackathon', 'mun', 'internship')),
  region TEXT NOT NULL CHECK (region IN ('kz', 'international')),
  city TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  target_grades INT[] DEFAULT ARRAY[8, 9, 10, 11]::INT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  requirements JSONB DEFAULT '[]'::JSONB, -- {"kz": [...], "ru": [...], "en": [...]} or string array
  link TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  interested_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. USER OPPORTUNITIES TABLE (Personal Kanban & Tracker)
CREATE TABLE IF NOT EXISTS public.user_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (
    status IN ('saved', 'in_progress', 'submitted', 'accepted', 'rejected', 'interested', 'preparing', 'applied', 'result_received')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT user_opportunities_unique UNIQUE (user_id, opportunity_id)
);

-- 4. AI ANALYSES TABLE (Match Score & Gap Audit)
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  strengths JSONB DEFAULT '[]'::JSONB,
  gaps JSONB DEFAULT '[]'::JSONB,
  recommendations JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ESSAY REVIEWS TABLE (Gemini AI Feedback)
CREATE TABLE IF NOT EXISTS public.essay_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_title TEXT NOT NULL,
  essay_text TEXT NOT NULL,
  ai_score INT NOT NULL CHECK (ai_score >= 1 AND ai_score <= 10),
  critique JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_region ON public.opportunities(region);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline ASC);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_user ON public.user_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_status ON public.user_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_opp ON public.ai_analyses(user_id, opportunity_id);

-- =====================================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    grade, 
    city,
    preferred_language
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Студент Wintality'),
    COALESCE(new.raw_user_meta_data->>'grade', '10 класс'),
    COALESCE(new.raw_user_meta_data->>'city', 'Алматы'),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'ru')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update interested_count in opportunities table
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

-- Safe RPC to increment views
CREATE OR REPLACE FUNCTION public.increment_opportunity_views(opp_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.opportunities
  SET views_count = views_count + 1
  WHERE id = opp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- 2. Opportunities (Public read)
DROP POLICY IF EXISTS "Opportunities public read" ON public.opportunities;
CREATE POLICY "Opportunities public read" ON public.opportunities FOR SELECT TO public USING (true);

-- 3. User Opportunities (User isolated)
DROP POLICY IF EXISTS "Users read own opportunities" ON public.user_opportunities;
CREATE POLICY "Users read own opportunities" ON public.user_opportunities FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own opportunities" ON public.user_opportunities;
CREATE POLICY "Users insert own opportunities" ON public.user_opportunities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own opportunities" ON public.user_opportunities;
CREATE POLICY "Users update own opportunities" ON public.user_opportunities FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own opportunities" ON public.user_opportunities;
CREATE POLICY "Users delete own opportunities" ON public.user_opportunities FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 4. AI Analyses
DROP POLICY IF EXISTS "Users read own ai analyses" ON public.ai_analyses;
CREATE POLICY "Users read own ai analyses" ON public.ai_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own ai analyses" ON public.ai_analyses;
CREATE POLICY "Users insert own ai analyses" ON public.ai_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Essay Reviews
DROP POLICY IF EXISTS "Users read own essay reviews" ON public.essay_reviews;
CREATE POLICY "Users read own essay reviews" ON public.essay_reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own essay reviews" ON public.essay_reviews;
CREATE POLICY "Users insert own essay reviews" ON public.essay_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- 6. PRODUCTION SEED DATA (18 Verified Kazakhstan & Global Opportunities)
-- =====================================================================

INSERT INTO public.opportunities (
  id, title, organization, description, category, region, city, deadline, target_grades, 
  tags, requirements, link, is_featured, interested_count, views_count
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  '{"ru": "Nazarbayev University Pre-College Summer Research", "kz": "Назарбаев Университетінің жазғы ғылыми-зерттеу бағдарламасы", "en": "Nazarbayev University Pre-College Summer Research"}',
  'Nazarbayev University (NU)',
  '{"ru": "Интенсивная летняя программа в кампусе Назарбаев Университета. Школьники работают в лабораториях с профессорами NU над исследовательскими проектами в области STEM и AI.", "kz": "Назарбаев Университетінің кампусындағы қарқынды жазғы бағдарлама. Оқушылар NU профессорларымен STEM және AI зертханаларында ғылыми жобалар бойынша жұмыс істейді.", "en": "Intensive summer pre-college research program at NU campus. High schoolers conduct hands-on STEM and AI research under the guidance of world-class faculty."}',
  'summer_program',
  'kz',
  'Астана',
  NOW() + INTERVAL '42 days',
  ARRAY[10, 11]::INT[],
  ARRAY['Nazarbayev University', 'Research', 'STEM', 'AI Lab', 'IELTS 6.0+']::TEXT[],
  '{"ru": ["Табель успеваемости (GPA не ниже 4.5/5.0)", "Сертификат IELTS (не менее 6.0) или Duolingo", "Мотивационное эссе о научном интересе", "Рекомендательное письмо преподавателя"], "kz": ["Үлгерім табелі (GPA кемінде 4.5/5.0)", "IELTS (кемінде 6.0) немесе Duolingo сертификаты", "Ғылыми қызығушылық туралы мотивациялық эссе", "Мұғалімнің ұсыныс хаты"], "en": ["Academic transcript (GPA 4.5+/5.0)", "IELTS certificate (6.0+) or Duolingo", "Statement of purpose in STEM", "Teacher recommendation letter"]}',
  'https://nu.edu.kz/',
  TRUE,
  382,
  2410
),
(
  'e1000000-0000-0000-0000-000000000002',
  '{"ru": "Республиканская олимпиада школьников («Дарын»)", "kz": "Оқушылардың республикалық олимпиадасы («Дарын»)", "en": "National School Olympiad ('Daryn')"}',
  'РНПЦ «Дарын» Минпросвещения РК',
  '{"ru": "Главное академическое соревнование страны по 16 общеобразовательным предметам. Победители получают гарантированные гранты в вузы Казахстана и путевку в нацсборную.", "kz": "16 жалпы білім беретін пән бойынша еліміздің басты олимпиадасы. Жеңімпаздар Қазақстанның ЖОО-ларына гранттар және ұлттық құрамаға жолдама алады.", "en": "The premier nationwide academic competition in 16 subjects. Winners secure full state university grants and qualification for international national teams."}',
  'olympiad',
  'kz',
  'Онлайн (РК)',
  NOW() + INTERVAL '22 days',
  ARRAY[8, 9, 10, 11]::INT[],
  ARRAY['Госгрант РК', 'Дарын', 'БВИ в вузы', 'Национальная сборная']::TEXT[],
  '{"ru": ["Официальная регистрация через школу на районный этап", "Победа на школьном туре", "Углубленное владение профильным предметом"], "kz": ["Мектеп арқылы аудандық кезеңге ресми тіркелу", "Мектеп кезеңінің жеңісі", "Бейіндік пәнді терең меңгеру"], "en": ["Official school registration for district round", "Victory at preliminary school round", "Advanced subject mastery"]}',
  'https://daryn.kz/',
  TRUE,
  640,
  4520
),
(
  'e1000000-0000-0000-0000-000000000003',
  '{"ru": "Международная Жаутыковская олимпиада (IZhO)", "kz": "Халықаралық Жәутіков олимпиадасы (IZhO)", "en": "International Zhautykov Olympiad (IZhO)"}',
  'РФМШ & Оргкомитет IZhO',
  '{"ru": "Легендарная олимпиада по математике, физике и информатике для команд специализированных школ из 25+ стран мира. Высочайший мировой уровень задач.", "kz": "Әлемнің 25+ елінен келген мамандандырылған мектептер командаларына арналған математика, физика және информатикадан аңызға айналған олимпиада.", "en": "Prestigious international Olympiad in Mathematics, Physics, and Computer Science for specialized STEM school teams from 25+ nations."}',
  'olympiad',
  'kz',
  'Алматы',
  NOW() + INTERVAL '73 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['РФМШ', 'IZhO', 'Спортивное программирование', 'Высшая математика']::TEXT[],
  '{"ru": ["Командная заявка от специализированной школы", "Победа во внутреннем отборе", "Английский для чтения условий задач"], "kz": ["Мамандандырылған мектептен командалық өтінім", "Ішкі іріктеуден сәтті өту", "Есеп шарттарын оқу үшін ағылшын тілі"], "en": ["Official team entry from specialized STEM school", "Top scores in internal selection", "Working English for problem statements"]}',
  'https://izho.kz/',
  TRUE,
  420,
  2980
),
(
  'e1000000-0000-0000-0000-000000000004',
  '{"ru": "Astana Hub & Программа Tech Orda (Финансирование IT)", "kz": "Astana Hub & Tech Orda бағдарламасы (IT-гранттар)", "en": "Astana Hub & Tech Orda IT Grant Vouchers"}',
  'Astana Hub & МЦРИАП РК',
  '{"ru": "Государственные ваучеры на бесплатное обучение передовым IT-специальностям (Web Development, Data Science, AI, GameDev) с последующим трудоустройством.", "kz": "Сұранысқа ие IT мамандықтары бойынша (Web Development, Data Science, AI) тегін оқуға және жұмысқа орналасуға мемлекеттік ваучерлер.", "en": "Government-backed funding vouchers for cutting-edge IT specializations (Fullstack, AI, Data Science, GameDev) with career placement."}',
  'grant',
  'kz',
  'Онлайн (РК)',
  NOW() + INTERVAL '32 days',
  ARRAY[11]::INT[],
  ARRAY['Tech Orda', 'Astana Hub', 'Грант 600 000 ₸', 'IT-карьера']::TEXT[],
  '{"ru": ["Гражданство РК (возраст 16+)", "Вступительный экзамен школы программирования", "Мотивационное собеседование"], "kz": ["ҚР азаматтығы (16 жастан жоғары)", "Бағдарламалау мектебінің кіру тесті", "Мотивациялық сұхбат"], "en": ["Kazakhstan citizenship (16+)", "School entrance logic & code test", "Interview"]}',
  'https://astanahub.com/',
  TRUE,
  512,
  3400
),
(
  'e1000000-0000-0000-0000-000000000005',
  '{"ru": "nFactorial Incubator — Запуск мобильного приложения", "kz": "nFactorial Инкубаторы — Мобильді қосымша шығару", "en": "nFactorial Incubator — Mobile App Launch"}',
  'nFactorial School',
  '{"ru": "Летний интенсив по разработке и запуску собственного IT-продукта в App Store / Google Play. Выпускники презентуют приложения инвесторам на Demo Day.", "kz": "App Store мен Google Play-де жеке IT-өнімді әзірлеу және іске қосу бойынша жазғы интенсив. Түлектер Demo Day-де инвесторларға таныстырады.", "en": "Intensive summer program to design, build, and launch a real iOS/Android app to the App Store followed by Demo Day with tech investors."}',
  'internship',
  'kz',
  'Алматы',
  NOW() + INTERVAL '85 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Стартап', 'App Store', 'Mobile Dev', 'Demo Day', 'iOS & Swift']::TEXT[],
  '{"ru": ["Базовые знания программирования", "Логическое тестовое задание", "Видео-визитка с концептом приложения"], "kz": ["Бағдарламалаудың негіздері", "Логикалық тесттік тапсырма", "Қосымша идеясы бар бейне-визитка"], "en": ["Fundamental programming skills", "Algorithmic assessment", "Video pitch of product concept"]}',
  'https://nfactorial.school/',
  TRUE,
  290,
  1870
),
(
  'e1000000-0000-0000-0000-000000000006',
  '{"ru": "Wharton Global High School Investment Competition", "kz": "Wharton жаһандық инвестициялық чемпионаты", "en": "Wharton Global High School Investment Competition"}',
  'Wharton School, University of Pennsylvania',
  '{"ru": "Международный командный турнир по финансовому анализу, инвестиционным стратегиям и управлению портфелем ценных бумаг для школьников 9–11 классов.", "kz": "9–11 сынып оқушыларына арналған қаржылық талдау, инвестициялық стратегиялар және қор нарығын басқару бойынша жаһандық командалық турнир.", "en": "World-leading team investment competition from Wharton School for high schoolers managing virtual $100k portfolio with real client strategy."}',
  'olympiad',
  'international',
  'Global',
  NOW() + INTERVAL '14 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Финансы', 'Инвестиции', 'Командный кейс', 'FinTech', 'Wharton']::TEXT[],
  '{"ru": ["Команда 4–7 школьников + учитель-эдвайзер", "Аналитический отчет по инвестициям", "Финальный видео-питч портфеля"], "kz": ["4–7 оқушыдан құралған команда + жетекші", "Инвестициялық стратегиялық есеп", "Қорытынды видео-питч"], "en": ["Team of 4–7 students + faculty advisor", "Comprehensive investment policy report", "Final strategy video pitch"]}',
  'https://globalyouth.wharton.upenn.edu/competitions/investment-competition/',
  TRUE,
  460,
  3100
),
(
  'e1000000-0000-0000-0000-000000000007',
  '{"ru": "Harvard Secondary School Program (SSP)", "kz": "Гарвард мектеп оқушыларына арналған жазғы бағдарламасы", "en": "Harvard Secondary School Program (SSP)"}',
  'Harvard University',
  '{"ru": "7-недельная академическая программа в кампусе Гарварда или онлайн. Старшеклассники изучают университетские курсы с получением кредитов колледжа.", "kz": "Гарвард кампусында немесе онлайн өтетін 7 апталық академиялық бағдарлама. Оқушылар колледж кредиттерімен университет курстарын оқиды.", "en": "Prestige 7-week college-credit academic experience at Harvard campus or online, taking actual undergraduate classes with Harvard faculty."}',
  'summer_program',
  'international',
  'Global',
  NOW() + INTERVAL '34 days',
  ARRAY[10, 11]::INT[],
  ARRAY['Ivy League', 'Академические кредиты', 'Leadership', 'English B2+']::TEXT[],
  '{"ru": ["GPA 3.5+ за 2 года", "Statement of Purpose (500 слов)", "Рекомендательное письмо преподавателя", "Подтверждение английского"], "kz": ["Соңғы 2 жылдағы GPA 3.5+", "Мотивациялық эссе (500 сөз)", "Мұғалімнің ұсыныс хаты", "Ағылшын тілі сертификаты"], "en": ["Cumulative GPA 3.5+", "Statement of Purpose essay", "Counselor/teacher recommendation", "English proficiency proof"]}',
  'https://summer.harvard.edu/high-school-programs/secondary-school-program/',
  TRUE,
  580,
  4100
),
(
  'e1000000-0000-0000-0000-000000000008',
  '{"ru": "Future Leaders Exchange (FLEX Program)", "kz": "Болашақ көшбасшылармен алмасу бағдарламасы (FLEX)", "en": "Future Leaders Exchange (FLEX Program)"}',
  'U.S. Department of State / American Councils',
  '{"ru": "Полная стипендия на 1 академический год учебы в старшей школе США с проживанием в американской семье. 100% покрытие всех расходов.", "kz": "АҚШ-тың мемлекеттік мектебінде 1 жыл тегін оқуға және отбасында тұруға 100% толық мемлекеттік стипендия.", "en": "Prestigious fully funded merit-based scholarship for 1 academic year of high school study and cultural exchange living with a host family in the USA."}',
  'grant',
  'international',
  'СНГ',
  NOW() + INTERVAL '24 days',
  ARRAY[9, 10]::INT[],
  ARRAY['100% Грант', 'Обмен', 'Лидерство', 'Культурный обмен']::TEXT[],
  '{"ru": ["Гражданство Казахстана (15–17 лет)", "3 тура отбора: онлайн-тест, 3 эссе, собеседование", "Академическая успеваемость выше среднего"], "kz": ["ҚР азаматтығы (15–17 жас)", "3 іріктеу кезеңі: тест, 3 эссе, сұхбаттасу", "Жақсы академиялық үлгерім"], "en": ["Kazakhstan citizenship (15–17 age bracket)", "Multi-round selection: SLEP/online test, 3 essays, panel interview", "Strong academic standing"]}',
  'https://www.discoverflex.org/',
  TRUE,
  710,
  5200
),
(
  'e1000000-0000-0000-0000-000000000009',
  '{"ru": "Decentrathon Web3 Hackathon Kazakhstan", "kz": "Decentrathon Web3 Хакатоны Қазақстан", "en": "Decentrathon Web3 Hackathon Kazakhstan"}',
  'Blockchain Center & Astana Hub',
  '{"ru": "Крупнейший мульти-локационный Web3 и AI хакатон Центральной Азии с призовым фондом 10 000 000 ₸. Команды создают смарт-контракты и AI-агентов.", "kz": "Жүлде қоры 10 000 000 ₸ құрайтын Орталық Азияның ең ірі Web3 және AI хакатоны. Командалар смарт-келісімшарттар мен AI-агенттер жасайды.", "en": "Central Asia leading multi-city Web3 and AI hackathon with $25k+ prize pool. Build decentralized applications, zero-knowledge tools, and AI agents."}',
  'hackathon',
  'kz',
  'Астана / Алматы',
  NOW() + INTERVAL '18 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Web3', 'Хакатон', 'Smart Contracts', 'AI Agents', 'Гранты']::TEXT[],
  '{"ru": ["Команда от 2 до 5 участников", "Рабочий прототип кода на GitHub", "Презентация на финальном питчинге"], "kz": ["2-ден 5 адамға дейінгі команда", "GitHub-тағы жұмыс істейтін прототип", "Қорытынды питчингтегі таныстырылым"], "en": ["Teams of 2 to 5 members", "Functional code repository on GitHub", "Working MVP demo pitch"]}',
  'https://decentrathon.io/',
  TRUE,
  330,
  2150
),
(
  'e1000000-0000-0000-0000-000000000010',
  '{"ru": "Harvard Model United Nations (HMUN)", "kz": "Гарвард БҰҰ Моделі (HMUN)", "en": "Harvard Model United Nations (HMUN)"}',
  'Harvard International Relations Council',
  '{"ru": "Крупнейшая международная конференция-симуляция ООН. Школьники представляют государства, участвуют в дебатах и составляют резолюции.", "kz": "БҰҰ-ның әлемдегі ең ірі симуляциялық конференциясы. Оқушылар мемлекеттерді таныстырады, пікірталастарға қатысады және қарарлар дайындайды.", "en": "Renowned high school United Nations simulation by Harvard IRC delegates confronting complex geopolitical, environmental, and financial issues."}',
  'mun',
  'international',
  'Global',
  NOW() + INTERVAL '11 days',
  ARRAY[8, 9, 10, 11]::INT[],
  ARRAY['MUN', 'Дебаты', 'Дипломатия', 'English B2/C1']::TEXT[],
  '{"ru": ["Position Paper по повестке комитета", "Регистрация делегации", "Знание парламентской процедуры"], "kz": ["Комитет күн тәртібі бойынша Position Paper", "Делегацияны тіркеу", "Парламенттік рәсімді білу"], "en": ["Position Paper on committee agenda", "Delegation registration", "Parliamentary procedure mastery"]}',
  'https://www.harvardmun.org/',
  FALSE,
  245,
  1800
),
(
  'e1000000-0000-0000-0000-000000000011',
  '{"ru": "Олимпиада КБТУ & Astana IT University на гранты", "kz": "ҚБТУ & AITU ректорлық гранттар олимпиадасы", "en": "KBTU & Astana IT University Rector Grant Olympiads"}',
  'КБТУ, AITU & IITU',
  '{"ru": "Ежегодные профильные олимпиады ведущих IT-вузов Казахстана. Победители получают 100% и 50% скидки на все 4 года бакалавриата.", "kz": "Қазақстанның жетекші IT университеттерінің жыл сайынғы бейіндік олимпиадалары. Жеңімпаздар бакалавриаттың 4 жылына 100% және 50% жеңілдік алады.", "en": "Annual subject Olympiads by premier technical universities in Kazakhstan awarding 100% full-tuition rector grants prior to state tests."}',
  'grant',
  'kz',
  'Астана / Алматы',
  NOW() + INTERVAL '45 days',
  ARRAY[11]::INT[],
  ARRAY['Ректорский грант', 'КБТУ', 'AITU', '100% грант', 'IT']::TEXT[],
  '{"ru": ["Выпускной 11 класс", "Регистрация на портале университета", "Очное участие в турах по математике/информатике"], "kz": ["11 сынып оқушысы", "Университет порталында тіркелу", "Математика немесе информатикадан кезеңдерге қатысу"], "en": ["Graduating 11th grade / final year", "Online registration on admissions portal", "In-person math or computer science exam rounds"]}',
  'https://kbtu.edu.kz/',
  FALSE,
  390,
  2750
),
(
  'e1000000-0000-0000-0000-000000000012',
  '{"ru": "Программа «Мың бала» Фонда «Ел Үміті»", "kz": "«Ел Үміті» қорының «Мың бала» ұлттық бағдарламасы", "en": "'Myn Bala' National Talent Initiative by El Umiti"}',
  'Фонд «Ел Үміті»',
  '{"ru": "Национальная программа поддержки одаренных школьников из сельских районов и малых городов. Обучение в школах БИЛ и РФМШ.", "kz": "Ауылдық жерлер мен шағын қалалардың дарынды оқушыларын қолдауға арналған ұлттық бағдарлама. БИЛ және РФМШ лицейлеріне жолдама.", "en": "Nationwide talent search identifying top academic students from regional towns to receive full scholarships at leading boarding STEM lyceums."}',
  'grant',
  'kz',
  'Онлайн (РК)',
  NOW() + INTERVAL '38 days',
  ARRAY[8, 9]::INT[],
  ARRAY['Ел Үміті', 'Мың бала', 'БИЛ', 'РФМШ грант', 'Ауыл жастары']::TEXT[],
  '{"ru": ["Ученики 8–9 классов из малых городов и сёл", "Тестирование по логике и математике", "Регистрация на портале 1000bala.elumiti.kz"], "kz": ["Ауыл мен шағын қалалардан 8–9 сынып оқушылары", "Логика мен математикадан тестілеу", "1000bala.elumiti.kz порталына тіркелу"], "en": ["Grades 8–9 from regional areas", "Comprehensive math & logic exam", "Portal submission on 1000bala.elumiti.kz"]}',
  'https://elumiti.kz/',
  FALSE,
  280,
  1950
),
(
  'e1000000-0000-0000-0000-000000000013',
  '{"ru": "Regeneron ISEF (Международный смотр науки и инженерии)", "kz": "Regeneron ISEF халықаралық ғылым мен инженерия байқауы", "en": "Regeneron International Science and Engineering Fair (ISEF)"}',
  'Society for Science & Regeneron',
  '{"ru": "Крупнейший в мире научный конкурс для старшеклассников с призовым фондом более $9 000 000. Главный трек поступления в MIT и Caltech.", "kz": "Жүлде қоры $9 000 000-нан асатын мектеп оқушыларына арналған әлемдегі ең ірі ғылыми байқау. MIT және Caltech-ке түсудің басты кілті.", "en": "The world premier global science competition for high school researchers awarding $9M+ in scholarships. Supreme credential for MIT, Caltech, Stanford."}',
  'olympiad',
  'international',
  'Global',
  NOW() + INTERVAL '60 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Наука', 'ISEF', 'MIT Pathway', 'Research', 'STEM $9M']::TEXT[],
  '{"ru": ["Победа на национальном этапе конкурса научных проектов", "Академическая научная статья и постер", "Английский язык C1"], "kz": ["Ғылыми жобалардың республикалық байқауындағы жеңіс", "Ғылыми мақала мен постер дайындау", "C1 деңгейіндегі ағылшын тілі"], "en": ["Affiliated national fair grand prize winner", "Complete scientific research paper & poster presentation", "Fluent English defense"]}',
  'https://www.societyforscience.org/isef/',
  TRUE,
  490,
  3800
),
(
  'e1000000-0000-0000-0000-000000000014',
  '{"ru": "Tinkoff FinTech Internship for Juniors", "kz": "Tinkoff FinTech жоғары сынып оқушыларына арналған тағылымдама", "en": "Tinkoff FinTech Internship for Juniors"}',
  'Tinkoff & Финтех-партнеры',
  '{"ru": "Оплачиваемая практическая стажировка в реальных продуктовых командах разработки (Backend, Data, Mobile) для школьников старших классов.", "kz": "Жоғары сынып оқушыларына арналған әзірлеу топтарындағы (Backend, Data, Mobile) ақылы өндірістік тағылымдама.", "en": "Paid software engineering and data analytics internship within actual high-load fintech teams for gifted high school coders."}',
  'internship',
  'kz',
  'Алматы / Удаленно',
  NOW() + INTERVAL '19 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['FinTech', 'Python', 'TypeScript', 'Оплачиваемый опыт']::TEXT[],
  '{"ru": ["Решение алгоритмического контеста", "Техническое интервью по коду", "Базовое портфолио на GitHub"], "kz": ["Алгоритмдік контестті шешу", "Код бойынша техникалық сұхбат", "GitHub-тағы жобалар"], "en": ["Online algorithmic contest", "Live code pairing interview", "GitHub pet projects"]}',
  'https://fintech.tinkoff.ru/activities/schoolkids/',
  FALSE,
  310,
  2100
),
(
  'e1000000-0000-0000-0000-000000000015',
  '{"ru": "Stanford Pre-Collegiate Summer Institutes", "kz": "Стэнфорд мектепке дейінгі жазғы институттары", "en": "Stanford Pre-Collegiate Summer Institutes"}',
  'Stanford University',
  '{"ru": "Трехнедельные углубленные курсы с профессорами Стэнфорда по направлениям: искусственный интеллект, математическое моделирование, бизнес.", "kz": "Стэнфорд профессорларымен жасанды интеллект, математикалық модельдеу және бизнес бағыттары бойынша үш апталық тереңдетілген курстар.", "en": "Three-week intensive academic seminar courses taught by Stanford instructors in AI, data science, bioscience, and philosophical logic."}',
  'summer_program',
  'international',
  'Global',
  NOW() + INTERVAL '45 days',
  ARRAY[9, 10, 11]::INT[],
  ARRAY['Stanford', 'Кремниевая долина', 'Искусственный интеллект']::TEXT[],
  '{"ru": ["Выписка школьных оценок за 2 года", "Развернутое мотивационное эссе", "Примеры академических работ"], "kz": ["Соңғы 2 жылдағы бағалар табелі", "Кеңейтілген мотивациялық эссе", "Академиялық жұмыстар үлгісі"], "en": ["Official transcripts past 2 years", "Intellectual essay response", "Work samples or portfolio"]}',
  'https://spcs.stanford.edu/programs/stanford-pre-collegiate-summer-institutes',
  FALSE,
  375,
  2600
),
(
  'e1000000-0000-0000-0000-000000000016',
  '{"ru": "International Olympiad in Informatics (IOI) Казахстанский отбор", "kz": "Информатикадан халықаралық олимпиадаға (IOI) ұлттық іріктеу", "en": "International Olympiad in Informatics (IOI) Kazakhstan Qualifiers"}',
  'РНПЦ «Дарын» & CP Federation KZ',
  '{"ru": "Национальные учебно-тренировочные сборы и отбор в олимпийскую сборную Казахстана на главную мировую олимпиаду по спортивному программированию.", "kz": "Спорттық бағдарламалау бойынша әлемдік олимпиадаға Қазақстанның ұлттық құрамасына оқу-жаттығу жиындары және іріктеу.", "en": "Kazakhstan national training camp and team selection for the World Championship in Competitive Programming (IOI)."}',
  'olympiad',
  'kz',
  'Алматы / Астана',
  NOW() + INTERVAL '50 days',
  ARRAY[8, 9, 10, 11]::INT[],
  ARRAY['IOI', 'Спортивное программирование', 'Алгоритмы C++', 'Нацсборная']::TEXT[],
  '{"ru": ["Диплом заключительного этапа олимпиады Дарын по информатике", "Рейтинг на Codeforces 1800+", "Успешное прохождение национальных сборов"], "kz": ["Информатикадан Дарын олимпиадасының жеңімпазы", "Codeforces рейтингі 1800+", "Ұлттық жиындардан сәтті өту"], "en": ["National Olympiad top ranking in CS", "Codeforces rating 1800+", "Performance in national selection rounds"]}',
  'https://daryn.kz/',
  TRUE,
  450,
  3200
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  description = EXCLUDED.description,
  deadline = EXCLUDED.deadline,
  interested_count = EXCLUDED.interested_count;
