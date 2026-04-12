"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FirstRunForm({ user }: { user: User }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [timezone, setTimezone] = useState(
    user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
  );
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, timezone }),
      });
      toast.success("Profile saved.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <form onSubmit={onSubmit} className="w-full border-y border-[var(--line)] py-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">First run</p>
          <h1 className="text-4xl font-semibold tracking-tight">Let&apos;s set up your profile.</h1>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            Your email is your permanent identity. The display name is only for display, and your timezone keeps your timeline aligned with local time.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-sm text-[var(--muted)]">This email will always be your account identity.</p>
          </div>
          <Button type="submit" disabled={isSaving} className="border-x-0 border-t-0 px-0">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save and continue
          </Button>
        </div>
      </form>
    </div>
  );
}
