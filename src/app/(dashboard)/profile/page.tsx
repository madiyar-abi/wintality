import { Metadata } from "next";
import { getCurrentUser } from "@/app/actions/auth";
import { ProfileSettings } from "@/components/profile/ProfileSettings";

export const metadata: Metadata = {
  title: "Настройки профиля | Wintality",
  description: "Академические интересы, класс и цели для персонального подбора программ.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return <ProfileSettings user={user} />;
}
