import { Opportunity } from "@/types";
import { expandedOpportunities } from "@/config/expandedOpportunities";

export const siteConfig = {
  name: "Wintality",
  title: "Wintality — Платформа возможностей и трекер дедлайнов",
  description: "Единый навигатор олимпиад, грантов, стажировок и программ в Казахстане и мире. Умный скоринг профиля и персональный Deadline Tracker.",
  tagline: "Win + Fatality: твой решающий шаг к поступлению и топовому портфолио",
  stats: [
    { label: "Проверенных программ", value: "100+" },
    { label: "Школьников и студентов", value: "10 000+" },
    { label: "Точность рекомендаций", value: "98%" },
    { label: "Стран и регионов", value: "25+" }
  ]
};

export const allOpportunities: Opportunity[] = expandedOpportunities;
