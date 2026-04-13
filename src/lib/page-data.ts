import { prisma } from "@/lib/prisma";
import { fetchCurrentTimer } from "@/lib/timer";
import { getDateRangeBounds } from "@/lib/date";
import { getStatsForPeriod, getYearHeatmapData } from "@/lib/stats";

export async function getDashboardData(userId: string, timezone: string) {
  const [activities, groups, timer, daily, weekly, monthly, total, heatmap] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, isDeleted: false },
      orderBy: { name: "asc" },
    }),
    prisma.categoryGroup.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    fetchCurrentTimer(userId),
    getStatsForPeriod(userId, timezone, "daily"),
    getStatsForPeriod(userId, timezone, "weekly"),
    getStatsForPeriod(userId, timezone, "monthly"),
    getStatsForPeriod(userId, timezone, "total"),
    getYearHeatmapData(userId, timezone),
  ]);

  return { activities, groups, timer, stats: { daily, weekly, monthly, total }, heatmap };
}

export async function getTimelineData(userId: string, timezone: string, anchorDate?: string) {
  const baseDate = anchorDate ? new Date(anchorDate) : new Date();
  const { startUtc, endUtc, days } = getDateRangeBounds(baseDate, timezone);
  const [entries, activities] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: startUtc },
        endTime: { lte: endUtc },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.activity.findMany({
      where: { userId, isDeleted: false },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    days,
    entries,
    activities,
    rangeStart: startUtc,
    rangeEnd: endUtc,
  };
}

export async function getActivitiesData(userId: string) {
  const [groups, activities] = await Promise.all([
    prisma.categoryGroup.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.activity.findMany({
      where: { userId, isDeleted: false },
      include: { group: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return { groups, activities };
}
