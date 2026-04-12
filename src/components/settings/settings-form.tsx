"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";

export function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [timezone, setTimezone] = useState(user.timezone);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, timezone }),
      });
      toast.success("Settings saved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isSaving} className="border-x-0 border-t-0 px-0">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save settings
          </Button>
        </div>
      </form>
    </Panel>
  );
}
