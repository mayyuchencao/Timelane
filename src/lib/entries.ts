import { EntrySourceType, Prisma, type TimeEntry } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import { getLocalDateKey, splitRangeByDay, toUtcFromLocalInput } from "@/lib/date";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { normalizeOptionalNote } from "@/lib/validators";

type EntryInput = {
  userId: string;
  activityId: string;
  startTime: string;
  endTime: string;
  note?: string | null;
  timezone: string;
  createdByType: EntrySourceType;
  timerSessionId?: string | null;
  replaceEntryId?: string | null;
};

export async function getActivitySnapshot(userId: string, activityId: string, tx: Prisma.TransactionClient = prisma) {
  const activity = await tx.activity.findFirst({
    where: { id: activityId, userId, isDeleted: false },
  });

  if (!activity) {
    throw new ApiError(404, "The selected event could not be found.");
  }

  return activity;
}

export async function assertNoOverlap(
  userId: string,
  startTime: Date,
  endTime: Date,
  ignoreEntryId?: string | null,
  tx: Prisma.TransactionClient = prisma,
) {
  const overlap = await tx.timeEntry.findFirst({
    where: {
      userId,
      ...(ignoreEntryId ? { id: { not: ignoreEntryId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (overlap) {
    throw new ApiError(409, "This time range overlaps with another entry.");
  }
}

export async function createSplitEntries(input: EntryInput, tx: Prisma.TransactionClient = prisma) {
  const startUtc = toUtcFromLocalInput(input.startTime, input.timezone);
  const endUtc = toUtcFromLocalInput(input.endTime, input.timezone);

  if (!(startUtc instanceof Date) || !(endUtc instanceof Date) || Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) {
    throw new ApiError(400, "Please provide a valid date range.");
  }

  if (startUtc >= endUtc) {
    throw new ApiError(400, "End time must be after start time.");
  }

  const activity = await getActivitySnapshot(input.userId, input.activityId, tx);
  await assertNoOverlap(input.userId, startUtc, endUtc, input.replaceEntryId, tx);

  const parts = splitRangeByDay(startUtc, endUtc, input.timezone);

  if (parts.length === 0) {
    throw new ApiError(400, "The time entry must be at least one minute long.");
  }

  if (input.replaceEntryId) {
    await tx.timeEntry.delete({
      where: { id: input.replaceEntryId },
    });
  }

  return Promise.all(
    parts.map((part) =>
      tx.timeEntry.create({
        data: {
          userId: input.userId,
          activityId: activity.id,
          activitySnapshotName: activity.name,
          activitySnapshotColor: activity.color,
          activityDeletedSnapshot: activity.isDeleted,
          timerSessionId: input.timerSessionId ?? null,
          startTime: part.startTime,
          endTime: part.endTime,
          durationMinutes: normalizeDurationMinutes(
            part.durationMinutes || differenceInMinutes(part.endTime, part.startTime),
          ),
          note: normalizeOptionalNote(input.note),
          createdByType: input.createdByType,
        },
      }),
    ),
  );
}

export async function getEntriesInRange(
  userId: string,
  startTime: Date,
  endTime: Date,
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.timeEntry.findMany({
    where: {
      userId,
      startTime: { gte: startTime },
      endTime: { lte: endTime },
    },
    orderBy: { startTime: "asc" },
  });
}

export function sumEntryMinutes(entries: Pick<TimeEntry, "durationMinutes">[]) {
  return entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
}

export function normalizeDurationMinutes(durationMinutes: number) {
  return Math.max(1, durationMinutes || 0);
}

export function groupEntriesByLocalDay<T extends Pick<TimeEntry, "startTime">>(
  entries: T[],
  timezone: string,
) {
  const grouped = new Map<string, T[]>();

  for (const entry of entries) {
    const dayKey = getLocalDateKey(entry.startTime, timezone);
    const current = grouped.get(dayKey) ?? [];
    current.push(entry);
    grouped.set(dayKey, current);
  }

  return grouped;
}
