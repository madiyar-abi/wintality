import { CheckCircle2, XCircle, Quote } from "lucide-react";

export function SocialProof() {
  const testimonials = [
    {
      name: "Данияр Касымов",
      role: "Финалист Wharton Global Investment Competition 2025",
      school: "11 класс, НИШ ФМН Алматы",
      quote: "Раньше я тратил часы на чтение десятков каналов, где 90% постов были либо устаревшими, либо не подходили школьникам из Казахстана. В Wintality я нашел кейс-турнир Wharton и успел собрать команду ровно за 2 недели до дедлайна."
    },
    {
      name: "Алина Серикова",
      role: "Стипендиатка FLEX 2025/26",
      school: "10 класс, Астана",
      quote: "Deadline Tracker спас мою подачу: я четко видела даты сдачи каждого из трех эссе. Алгоритм сразу подсказал, какие документы нужно запросить у администрации школы заранее."
    },
    {
      name: "Санжар Ибрагимов",
      role: "Участник Harvard Secondary School Program",
      school: "Выпускник 2025, поступил в NYU",
      quote: "Благодаря летней школе Гарварда у меня были академические кредиты и сильное рекомендательное письмо от профессора. Wintality позволил мне сфокусироваться на подготовке эссе вместо поиска информации."
    }
  ];

  return (
    <section id="about" className="py-20 border-b border-zinc-800/80 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Comparison: Without vs With Wintality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Chaos */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase tracking-wider">
              <XCircle className="w-4 h-4 text-zinc-500" />
              <span>Без системного подхода</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Хаос сотен источников
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-bold">•</span>
                <span>Сотни Telegram-каналов и постов в Instagram с дублирующейся информацией.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-bold">•</span>
                <span>Упущенные дедлайны: о подаче узнаешь за 1 день до закрытия формы.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-bold">•</span>
                <span>Подача вслепую в программы, куда школьник не проходит по классу или языку.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Wintality */}
          <div className="zinc-card p-6 sm:p-8 rounded-2xl border border-blue-500/30 bg-blue-500/[0.02] space-y-4">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-wider font-semibold">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>С платформой Wintality</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Единый карьерный навигатор
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Персонализированная лента: только проверенные программы под твой профиль.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Deadline Tracker: обратный отсчет, напоминания и четкий чек-лист документов.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>AI-объяснение: понятный разбор сильных сторон и того, чего не хватает в заявке.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Истории успеха
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Опыт школьников, которые побеждают
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="zinc-card p-6 rounded-2xl border border-zinc-800/80 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Quote className="w-5 h-5 text-zinc-600" />
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    «{t.quote}»
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="font-bold text-xs text-white">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                    {t.role}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {t.school}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
