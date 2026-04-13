"use client";

import { useMemo, useState } from "react";
import type { Activity, TimeEntry, User } from "@prisma/client";
import { addDays, format, parseISO, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toZonedTime } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatLocal, getLocalDateKey } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";
import { EntryEditorDialog } from "@/components/timeline/entry-editor-dialog";

const HOUR_HEIGHT = 48;

function getMinutesSinceDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function TimelineBoard({
  user,
  days,
  entries,
  activities,
}: {
  user: User;
  days: Date[];
  entries: TimeEntry[];
  activities: Activity[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const groupedEntries = useMemo(() => {
    return days.map((day) => {
      const dayKey = getLocalDateKey(day, user.timezone);
      return {
        day,
        dayKey,
        items: entries.filter((entry) => getLocalDateKey(entry.startTime, user.timezone) === dayKey),
      };
    });
  }, [days, entries, user.timezone]);

  const rangeStart = days[0] ? getLocalDateKey(days[0], user.timezone) : getLocalDateKey(new Date(), user.timezone);

  function moveRange(offsetDays: number) {
    const current = parseISO(rangeStart);
    const next = offsetDays > 0 ? addDays(current, offsetDays) : subDays(current, Math.abs(offsetDays));
    router.push(`/timeline?date=${format(next, "yyyy-MM-dd")}`);
  }

  return (
    <div className="space-y-6">
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Timeline</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Seven days of recorded time.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => moveRange(-7)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <input
            type="date"
            value={rangeStart}
            onChange={(event) => router.push(`/timeline?date=${event.target.value}`)}
            className="h-10 rounded-[14px] border border-[var(--line)] bg-transparent px-4 text-sm outline-none"
          />
          <Button variant="ghost" size="sm" onClick={() => router.push("/timeline")}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => moveRange(7)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" className="rounded-[14px]" onClick={() => {
            setSelectedEntry(null);
            setOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Add entry
          </Button>
        </div>
      </Panel>

      <Panel className="p-0">
        <div className="grid grid-cols-[72px_repeat(7,minmax(160px,1fr))] border-b border-[var(--line)] px-4 py-4">
          <div />
          {days.map((day) => (
            <div key={day.toISOString()} className="px-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                {formatLocal(day, user.timezone, "EEE")}
              </p>
              <p className="mt-2 text-lg font-medium">{formatLocal(day, user.timezone, "MMM d")}</p>
            </div>
          ))}
        </div>
        <ScrollArea className="h-[72vh]">
          <div className="grid grid-cols-[72px_repeat(7,minmax(160px,1fr))]">
            <div className="relative border-r border-[var(--line)]">
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="relative h-[48px] border-b border-[var(--line)] pr-3 pt-1 text-right text-xs text-[var(--muted)]"
                >
                  {hour === 0 ? "" : `${hour % 12 || 12}${hour >= 12 ? "PM" : "AM"}`}
                </div>
              ))}
            </div>
            {groupedEntries.map((column) => (
              <div key={column.dayKey} className="relative border-r border-[var(--line)] last:border-r-0">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="h-[48px] border-b border-[var(--line)]" />
                ))}
                {column.items.map((entry) => {
                  const start = toZonedTime(entry.startTime, user.timezone);
                  const end = toZonedTime(entry.endTime, user.timezone);
                  const top = (getMinutesSinceDayStart(start) / 60) * HOUR_HEIGHT;
                  const height = Math.max(34, ((end.getTime() - start.getTime()) / 3600000) * HOUR_HEIGHT);

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className="absolute left-2 right-2 overflow-hidden border-l-2 px-2 py-1 text-left transition hover:bg-black/[0.015]"
                      style={{
                        top,
                        height,
                        borderColor: entry.activitySnapshotColor,
                        background: `${entry.activitySnapshotColor}12`,
                      }}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setOpen(true);
                      }}
                    >
                      <p className="truncate text-[13px] font-medium leading-5">
                        {entry.activitySnapshotName}
                        {entry.activityDeletedSnapshot ? " · Deleted event" : ""}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                        {format(start, "HH:mm")} - {format(end, "HH:mm")} · {formatMinutes(entry.durationMinutes)}
                      </p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Panel>
      <EntryEditorDialog
        activities={activities}
        open={open}
        onOpenChange={setOpen}
        entry={selectedEntry}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
