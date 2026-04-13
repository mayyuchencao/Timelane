import { addDays, endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { getEntriesInRange, groupEntriesByLocalDay, sumEntryMinutes } from "@/lib/entries";
import { prisma } from "@/lib/prisma";
import { getLocalDateKey, getPeriodRange } from "@/lib/date";
import { percentage } from "@/lib/utils";

export async function getStatsForPeriod(
  userId: string,
  timezone: string,
  period: "daily" | "weekly" | "monthly" | "total",
) {
  const range = getPeriodRange(period, timezone);
  const entries = await prisma.timeEntry.findMany({
    where: {
      userId,
      ...(range
        ? {
            startTime: { gte: range.start },
            endTime: { lte: range.end },
          }
        : {}),
    },
    include: {
      activity: {
        include: {
          group: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const totalMinutes = sumEntryMinutes(entries);
  const grouped = new Map<
    string,
    { activityName: string; color: string; minutes: number; deleted: boolean; groupName: string }
  >();

  for (const entry of entries) {
    const key = `${entry.activitySnapshotName}-${entry.activitySnapshotColor}-${entry.activityDeletedSnapshot}`;
    const current = grouped.get(key) ?? {
      activityName: entry.activitySnapshotName,
      color: entry.activitySnapshotColor,
      minutes: 0,
      deleted: entry.activityDeletedSnapshot,
      groupName: entry.activity?.group?.name ?? "Ungrouped",
    };
    current.minutes += entry.durationMinutes;
    grouped.set(key, current);
  }

  return {
    totalMinutes,
    items: Array.from(grouped.values())
      .sort((a, b) => b.minutes - a.minutes)
      .map((item) => ({
        activityName: item.activityName,
        color: item.color,
        minutes: item.minutes,
        deleted: item.deleted,
        groupName: item.groupName,
        percentage: percentage(item.minutes, totalMinutes),
      })),
  };
}

export async function getYearHeatmapData(userId: string, timezone: string) {
  const todayKey = getLocalDateKey(new Date(), timezone);
  const todayDate = parseISO(todayKey);
  const firstTrackedDay = subDays(todayDate, 364);
  const calendarStartLocal = startOfWeek(firstTrackedDay, { weekStartsOn: 0 });
  const calendarEndLocal = endOfWeek(todayDate, { weekStartsOn: 0 });
  const calendarStartKey = format(calendarStartLocal, "yyyy-MM-dd");
  const calendarEndKey = format(calendarEndLocal, "yyyy-MM-dd");
  const calendarStart = fromZonedTime(`${calendarStartKey}T00:00:00.000`, timezone);
  const calendarEnd = fromZonedTime(`${calendarEndKey}T23:59:59.999`, timezone);

  const entries = await getEntriesInRange(userId, calendarStart, calendarEnd);
  const entriesByDay = groupEntriesByLocalDay(entries, timezone);

  const trackedDays: Array<{
    dateKey: string;
    date: Date;
  }> = [];
  const visibleKeys = new Set<string>();
  let cursor = calendarStartLocal;

  while (cursor <= calendarEndLocal) {
    const dateKey = format(cursor, "yyyy-MM-dd");
    trackedDays.push({ dateKey, date: cursor });

    if (dateKey >= format(firstTrackedDay, "yyyy-MM-dd") && dateKey <= todayKey) {
      visibleKeys.add(dateKey);
    }

    cursor = addDays(cursor, 1);
  }

  const maxMinutes = Math.max(
    ...Array.from(entriesByDay.values(), (dayEntries) => sumEntryMinutes(dayEntries)),
    0,
  );

  const days = trackedDays.map(({ dateKey, date }) => {
    const dayEntries = entriesByDay.get(dateKey) ?? [];
    const minutes = sumEntryMinutes(dayEntries);
    const isInRange = visibleKeys.has(dateKey);

    let level = 0;

    if (isInRange && minutes > 0 && maxMinutes > 0) {
      const ratio = minutes / maxMinutes;

      if (ratio >= 0.75) {
        level = 4;
      } else if (ratio >= 0.5) {
        level = 3;
      } else if (ratio >= 0.25) {
        level = 2;
      } else {
        level = 1;
      }
    }

    return {
      date: dateKey,
      minutes,
      level,
      isInRange,
      tooltipLabel: format(date, "MMMM d, yyyy"),
    };
  });

  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);

  return {
    totalMinutes,
    maxMinutes,
    days,
  };
}
