import type { User } from "@prisma/client";
import { getActivitiesData } from "@/lib/page-data";
import { ActivitiesManager } from "@/components/activities/activities-manager";

export async function ActivitiesPage({ user }: { user: User }) {
  const data = await getActivitiesData(user.id);
  return <ActivitiesManager {...data} />;
}
