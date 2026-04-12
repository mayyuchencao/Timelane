import type { User } from "@prisma/client";
import { SettingsForm } from "@/components/settings/settings-form";
import { Panel } from "@/components/ui/panel";

export function SettingsPage({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Profile and timezone</h1>
      </Panel>
      <SettingsForm user={user} />
    </div>
  );
}
