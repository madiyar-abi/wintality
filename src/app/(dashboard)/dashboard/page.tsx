import { Metadata } from "next";
import { getCurrentUser } from "@/app/actions/auth";
import { DashboardTracker } from "@/components/dashboard/DashboardTracker";

export const metadata: Metadata = {
  title: "Личный кабинет | Deadline Tracker",
  description: "Персональный трекер дедлайнов и статус подготовки заявок на олимпиады, гранты и стажировки.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <DashboardTracker user={user} />;
}
