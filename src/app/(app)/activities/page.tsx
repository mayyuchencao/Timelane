import { ActivitiesPage } from "@/components/activities/activities-page";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ActivitiesRoute() {
  const user = await requireUser();
  return <ActivitiesPage user={user} />;
}
