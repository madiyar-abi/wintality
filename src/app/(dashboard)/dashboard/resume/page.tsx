"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Printer, 
  ArrowLeft, 
  FileCheck2, 
  Sparkles, 
  Download, 
  Check, 
  Edit3, 
  Plus, 
  Trash2, 
  GraduationCap, 
  Award, 
  Briefcase, 
  BookOpen 
} from "lucide-react";
import { toast } from "sonner";

interface EducationItem {
  school: string;
  grade: string;
  period: string;
  gpa: string;
  city: string;
}

interface AwardItem {
  title: string;
  issuer: string;
  year: string;
  description: string;
}

interface ActivityItem {
  role: string;
  organization: string;
  period: string;
  bullets: string[];
}

export default function ResumeBuilderPage() {
  const [fullName, setFullName] = useState("Амели Сапарбаева (Ameli Saparbayeva)");
  const [contactInfo, setContactInfo] = useState("Алматы, Казахстан • ameli.saparbayeva@wintality.kz • linkedin.com/in/ameli • +7 (777) 123-45-67");
  const [targetMajor, setTargetMajor] = useState("Computer Science & Applied Artificial Intelligence");

  const [education, setEducation] = useState<EducationItem>({
    school: "Республиканская физико-математическая школа (РФМШ) / NIS",
    grade: "10 класс (Выпуск 2027)",
    period: "2023 – Настоящее время",
    gpa: "GPA: 4.95 / 5.0 (Top 5% параллели)",
    city: "Алматы, Казахстан"
  });

  const [awards, setAwards] = useState<AwardItem[]>([
    {
      title: "Диплом II степени заключительного этапа Республиканской олимпиады школьников («Дарын»)",
      issuer: "РНПЦ «Дарын» Минпросвещения РК",
      year: "2026",
      description: "Олимпиадный трек по информатике и алгоритмическому программированию (C++ / Python)."
    },
    {
      title: "Победитель Decentrathon Web3 Hackathon (Astana Hub)",
      issuer: "Blockchain Center & МЦРИАП РК",
      year: "2026",
      description: "Разработка децентрализованного смарт-контракта и AI-агента для EdTech в составе команды из 4 человек."
    },
    {
      title: "Призер Международной Жаутыковской олимпиады (IZhO Honorable Mention)",
      issuer: "Оргкомитет IZhO & РФМШ",
      year: "2025",
      description: "Участие среди 600 сильнейших школьников-программистов из 25 стран мира."
    }
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      role: "Исследователь-стажер (Research Fellow)",
      organization: "Nazarbayev University Pre-College Summer Research",
      period: "Лето 2025",
      bullets: [
        "Исследование мультимодальных нейросетей под руководством профессора департамента Computer Science NU.",
        "Соавторство в научной статье о персонализации образовательного контента для региональных школ РК.",
        "Презентация результатов на университетском научном коллоквиуме."
      ]
    },
    {
      role: "Главный делегат (Head Delegate) & Победитель Best Delegate",
      organization: "Harvard Model United Nations (HMUN) Delegation",
      period: "2025 – 2026",
      bullets: [
        "Представление позиции по вопросам глобального регулирования искусственного интеллекта и кибербезопасности.",
        "Подготовка итоговой резолюции комитета с участием 80 делегатов из 18 стран."
      ]
    },
    {
      role: "Лидер школьного клуба программирования & Ментор",
      organization: "Wintality Peer-to-Peer Coding Club",
      period: "2024 – Настоящее время",
      bullets: [
        "Организация бесплатных практических воркшопов по алгоритмам для 40+ учеников 7–9 классов.",
        "Подготовка 6 призеров районного этапа олимпиады школьников."
      ]
    }
  ]);

  const [skills, setSkills] = useState([
    "Языки программирования: Python, C++, TypeScript, SQL",
    "Языковые сертификаты: Английский (IELTS 7.5 Academic / C1), Казахский (Родной), Русский (Свободный)",
    "Технологии и инструменты: PyTorch, Next.js, Git, Supabase, LaTeX, Data Science"
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в кабинет</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Печать / Экспорт в PDF</span>
        </button>
      </div>

      {/* Header Info Banner */}
      <div className="space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Harvard Standard Academic Resume Builder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Академическое резюме для университетов и грантов
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Резюме собрано в классическом гарвардском академическом стиле: строгий черно-белый формат, идеальный кернинг, структурированные победы в олимпиадах РК и внеучебная деятельность.
        </p>
      </div>

      {/* Live CV Document Container */}
      <div className="bg-white text-zinc-950 border border-zinc-200 rounded-2xl shadow-xl p-8 sm:p-12 space-y-6 font-serif leading-relaxed text-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Name & Contact Header */}
        <div className="text-center space-y-1.5 border-b-2 border-zinc-950 pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider font-sans">
            {fullName}
          </h2>
          <p className="text-xs text-zinc-700 font-sans tracking-wide">
            {contactInfo}
          </p>
          <p className="text-xs italic font-medium text-zinc-800">
            Target Academic Focus: {targetMajor}
          </p>
        </div>

        {/* 1. Education */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-1 text-zinc-900">
            Education & Academic Standing
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-baseline font-bold font-sans">
              <span>{education.school}</span>
              <span>{education.city}</span>
            </div>
            <div className="flex justify-between items-baseline italic text-zinc-700">
              <span>{education.grade} — {education.gpa}</span>
              <span>{education.period}</span>
            </div>
          </div>
        </section>

        {/* 2. Honors & Awards */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-1 text-zinc-900">
            Honors & Academic Awards
          </h3>
          <div className="space-y-2.5 text-xs">
            {awards.map((award, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{award.title}</span>
                  <span className="font-mono text-[11px] font-semibold text-zinc-600">{award.year}</span>
                </div>
                <div className="text-zinc-600 italic text-[11px]">
                  {award.issuer}
                </div>
                <p className="text-zinc-800 leading-normal">
                  {award.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Extracurriculars & Research */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-1 text-zinc-900">
            Research, Projects & Leadership Experience
          </h3>
          <div className="space-y-3 text-xs">
            {activities.map((act, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-bold">{act.organization}</span>
                  <span className="text-[11px] text-zinc-600">{act.period}</span>
                </div>
                <div className="italic text-zinc-700 text-[11px]">
                  {act.role}
                </div>
                <ul className="list-disc list-outside pl-4 space-y-0.5 text-zinc-800">
                  {act.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-snug">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Skills & Certifications */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans border-b border-zinc-400 pb-1 text-zinc-900">
            Skills, Languages & Certifications
          </h3>
          <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-zinc-800">
            {skills.map((skill, idx) => (
              <li key={idx}>
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
