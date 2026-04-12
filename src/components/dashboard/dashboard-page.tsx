import type { User } from "@prisma/client";
import { getDashboardData } from "@/lib/page-data";
import { TimerPanel } from "@/components/dashboard/timer-panel";
import { StatsPanel } from "@/components/dashboard/stats-panel";

export async function DashboardPage({ user }: { user: User }) {
  const data = await getDashboardData(user.id, user.timezone);

  return (
    <div className="space-y-6">
      <TimerPanel activities={data.activities} initialTimer={data.timer} />
      <StatsPanel stats={data.stats} groups={data.groups} />
    </div>
  );
}
