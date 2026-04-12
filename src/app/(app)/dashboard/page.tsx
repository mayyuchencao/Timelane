import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardRoute() {
  const user = await requireUser();
  return <DashboardPage user={user} />;
}
