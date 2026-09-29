import { notFound } from "next/navigation";
import Link from "next/link";
import { allOpportunities } from "@/config/site";
import { OpportunityDetailActions } from "@/components/opportunities/OpportunityDetailActions";
import { 
  Clock, 
  MapPin, 
  GraduationCap, 
  Globe2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const opp = allOpportunities.find((o) => o.id === id);

  if (!opp) {
    return { title: "Программа не найдена | Wintality" };
  }

  return {
    title: `${opp.title} | Wintality`,
    description: opp.description,
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = allOpportunities.find((o) => o.id === id);

  if (!opportunity) {
    notFound();
  }

  const related = allOpportunities
    .filter((o) => o.id !== opportunity.id && (o.category === opportunity.category || o.scope === opportunity.scope))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: opportunity.title,
    description: opportunity.description,
    credentialCategory: opportunity.categoryLabel,
    recognizedBy: {
      "@type": "Organization",
      name: opportunity.organizer,
      url: opportunity.link,
    },
    validFor: {
      "@type": "QuantitativeValue",
      value: opportunity.daysLeft,
      unitCode: "DAY",
    },
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back button */}
      <div>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в каталог</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="zinc-card p-6 sm:p-8 rounded-3xl border border-zinc-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                {opportunity.flag}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                {opportunity.categoryLabel}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {opportunity.cityBadge}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {opportunity.organizer}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span>{opportunity.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-zinc-500" />
                <span>Классы: {opportunity.gradeMin}–{opportunity.gradeMax}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-zinc-500" />
                <span>Язык: {opportunity.englishRequired}</span>
              </div>
            </div>
          </div>

          {/* Deadline Countdown Box */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shrink-0 md:text-right space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Срок подачи заявок
            </div>
            <div className="text-xl font-bold text-white">
              {opportunity.deadlineDate}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Осталось {opportunity.daysLeft} дней</span>
            </div>
          </div>
        </div>

        {/* Action buttons (client component with AI evaluation) */}
        <OpportunityDetailActions opportunity={opportunity} />
      </div>

      {/* Grid: Details & AI Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Description & Requirements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Full description */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-800/80 space-y-4">
            <h2 className="text-lg font-bold text-white">О программе</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              {opportunity.fullDescription || opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-800/80 space-y-4">
            <h2 className="text-lg font-bold text-white">Критерии отбора и документы</h2>
            <ul className="space-y-3">
              {opportunity.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="zinc-card p-5 rounded-2xl border border-zinc-800/80 space-y-2">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
              Теги и направления
            </span>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Match Scorecard */}
        <div className="lg:col-span-4 space-y-6">
          <div className="zinc-card p-6 rounded-2xl border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Скоринг шансов</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {opportunity.matchScore || 92}% Match
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Почему подходит:
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                {(opportunity.matchReasons || [
                  "Соответствует возрастному диапазону и классу",
                  "Уровень языка подходит для уверенного участия"
                ]).map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-200 block">Совет по подготовке:</span>
              <p className="text-[11px] leading-relaxed">
                Нажмите кнопку «Оценить шансы с ИИ» вверху для персонального аудита ваших сильных сторон и расчета гэпов.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {related.length > 0 && (
        <div className="pt-8 border-t border-zinc-800/80 space-y-4">
          <h2 className="text-xl font-bold text-white">Похожие возможности</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/opportunities/${rel.id}`}
                className="zinc-card p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 block"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lg">{rel.flag}</span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {rel.daysLeft} дн.
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-200 line-clamp-1 hover:text-blue-400">
                  {rel.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {rel.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
