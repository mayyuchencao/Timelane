import { eachDayOfInterval, endOfDay, endOfWeek, startOfDay, startOfWeek, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { formatLocal, getPeriodRange } from "@/lib/date";
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

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
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
  const today = toZonedTime(new Date(), timezone);
  const firstTrackedDay = subDays(startOfDay(today), 364);
  const calendarStartLocal = startOfWeek(firstTrackedDay, { weekStartsOn: 0 });
  const calendarEndLocal = endOfWeek(today, { weekStartsOn: 0 });
  const calendarStart = fromZonedTime(calendarStartLocal, timezone);
  const calendarEnd = fromZonedTime(endOfDay(calendarEndLocal), timezone);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId,
      startTime: {
        gte: calendarStart,
        lte: calendarEnd,
      },
    },
    select: {
      startTime: true,
      durationMinutes: true,
    },
    orderBy: { startTime: "asc" },
  });

  const minutesByDay = new Map<string, number>();

  for (const entry of entries) {
    const dayKey = formatLocal(entry.startTime, timezone, "yyyy-MM-dd");
    minutesByDay.set(dayKey, (minutesByDay.get(dayKey) ?? 0) + entry.durationMinutes);
  }

  const trackedDays = eachDayOfInterval({ start: calendarStartLocal, end: calendarEndLocal });
  const visibleKeys = new Set(
    eachDayOfInterval({ start: firstTrackedDay, end: startOfDay(today) }).map((date) =>
      formatLocal(date, timezone, "yyyy-MM-dd"),
    ),
  );

  const maxMinutes = Math.max(...Array.from(minutesByDay.values()), 0);

  const days = trackedDays.map((date) => {
    const dateKey = formatLocal(date, timezone, "yyyy-MM-dd");
    const minutes = minutesByDay.get(dateKey) ?? 0;
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
      dayLabel: formatLocal(date, timezone, "EEE"),
      monthLabel: formatLocal(date, timezone, "MMM"),
      tooltipLabel: formatLocal(date, timezone, "MMMM d, yyyy"),
    };
  });

  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);

  return {
    totalMinutes,
    maxMinutes,
    days,
  };
}
