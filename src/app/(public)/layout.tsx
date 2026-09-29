import { getCurrentUser } from "@/app/actions/auth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-blue-600/30 selection:text-blue-200 transition-colors">
      <PublicHeader user={user} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
