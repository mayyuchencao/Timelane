"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@prisma/client";
import { Loader2, Pause, Play, Square, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client";
import { formatMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { SearchableSelect } from "@/components/ui/searchable-select";

type CurrentTimer = {
  id: string;
  status: "running" | "paused" | "completed";
  currentSegmentStartAt: string | Date | null;
  activity: { id: string; name: string; color: string; isDeleted: boolean };
  totalMinutes: number;
} | null;

export function TimerPanel({
  activities,
  initialTimer,
}: {
  activities: Activity[];
  initialTimer: CurrentTimer;
}) {
  const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id ?? "");
  const [timer, setTimer] = useState<CurrentTimer>(initialTimer);
  const [tick, setTick] = useState(Date.now());
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setTick(Date.now()), 1000);
    const polling = window.setInterval(refreshTimer, 20000);
    return () => {
      window.clearInterval(interval);
      window.clearInterval(polling);
    };
  }, []);

  async function refreshTimer() {
    try {
      const next = await apiFetch<CurrentTimer>("/api/timer/current");
      setTimer(next);
    } catch {
      return;
    }
  }

  async function runAction(path: string, body?: Record<string, string>) {
    setIsWorking(true);
    try {
      await apiFetch(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      await refreshTimer();
      toast.success("Timer updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Timer action failed.");
    } finally {
      setIsWorking(false);
    }
  }

  const liveLabel = useMemo(() => {
    if (!timer) return "0m";

    if (timer.status !== "running" || !timer.currentSegmentStartAt) {
      return formatMinutes(timer.totalMinutes);
    }

    const elapsed = Math.max(
      0,
      Math.floor((tick - new Date(timer.currentSegmentStartAt).getTime()) / 60000),
    );

    return formatMinutes(timer.totalMinutes + elapsed);
  }, [tick, timer]);

  return (
    <Panel className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-end justify-between gap-6 border-b border-[var(--line)] pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Current timer</p>
            <p className="mt-2 text-lg">
              {timer ? timer.activity.name : "No event running"}
            </p>
          </div>
        </div>
        <div className="pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Tracked duration</p>
          <p className="mt-3 text-5xl font-semibold tracking-tight">{liveLabel}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Paused periods stay empty on the timeline, and each resume creates a new block.
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className={timer ? "space-y-2 opacity-55" : "space-y-2"}>
          <Label htmlFor="activity">Event</Label>
          <SearchableSelect
            value={selectedActivityId}
            onValueChange={setSelectedActivityId}
            disabled={!!timer}
            placeholder="Choose an event"
            searchPlaceholder="Search events..."
            options={activities.map((activity) => ({
              value: activity.id,
              label: activity.name,
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {!timer ? (
            <Button disabled={!selectedActivityId || isWorking} onClick={() => runAction("/api/timer/start", { activityId: selectedActivityId })}>
              {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start timer
            </Button>
          ) : null}
          {timer?.status === "running" ? (
            <Button disabled={isWorking} onClick={() => runAction("/api/timer/pause")}>
              {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
              Pause
            </Button>
          ) : null}
          {timer?.status === "paused" ? (
            <Button disabled={isWorking} onClick={() => runAction("/api/timer/resume")}>
              {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
              Resume
            </Button>
          ) : null}
          {timer ? (
            <Button variant="ghost" disabled={isWorking} onClick={() => runAction("/api/timer/stop")}>
              {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
              Stop
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
