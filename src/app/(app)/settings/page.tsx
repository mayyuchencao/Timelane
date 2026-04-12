import { SettingsPage } from "@/components/settings/settings-page";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsRoute() {
  const user = await requireUser();
  return <SettingsPage user={user} />;
}
