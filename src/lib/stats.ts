import { prisma } from "@/lib/prisma";
import { getPeriodRange } from "@/lib/date";
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
