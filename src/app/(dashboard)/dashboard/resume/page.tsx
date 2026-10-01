import { Metadata } from "next";
import { getCurrentUser } from "@/app/actions/auth";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "Генератор академического резюме (CV) | Harvard Standard",
  description: "Интерактивный конструктор академического резюме по стандартам Harvard Ivy League с моментальным экспортом в PDF.",
};

export default async function ResumePage() {
  const user = await getCurrentUser();
  return <ResumeBuilder initialUser={user} />;
}
