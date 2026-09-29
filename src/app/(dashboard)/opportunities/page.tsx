import { Metadata } from "next";
import { OpportunitiesCatalog } from "@/components/opportunities/OpportunitiesCatalog";

export const metadata: Metadata = {
  title: "Каталог олимпиад, грантов и стажировок",
  description: "Поиск и фильтрация проверенных программ для школьников и студентов: летние школы, олимпиады, MUN, гранты и стажировки.",
};

export default function OpportunitiesPage() {
  return <OpportunitiesCatalog />;
}
