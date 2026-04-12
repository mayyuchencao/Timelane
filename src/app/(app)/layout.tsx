import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  if (!user.displayName) {
    redirect("/first-run");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
