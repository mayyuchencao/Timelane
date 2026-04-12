import { TimerStatus, type Prisma } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import { splitRangeByDay } from "@/lib/date";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

async function getActiveTimer(userId: string, tx: Prisma.TransactionClient = prisma) {
  return tx.timerSession.findFirst({
    where: {
      userId,
      status: { in: [TimerStatus.running, TimerStatus.paused] },
    },
    include: {
      activity: true,
      user: true,
      timeEntries: {
        orderBy: { startTime: "asc" },
      },
    },
  });
}

async function createSegmentEntry(now: Date, session: Awaited<ReturnType<typeof getActiveTimer>>, tx: Prisma.TransactionClient) {
  if (!session?.currentSegmentStartAt) return null;

  if (now <= session.currentSegmentStartAt) {
    throw new ApiError(400, "The timer segment is invalid.");
  }

  const parts = splitRangeByDay(session.currentSegmentStartAt, now, session.user.timezone);

  return Promise.all(
    parts.map((part) =>
      tx.timeEntry.create({
        data: {
          userId: session.userId,
          activityId: session.activityId,
          activitySnapshotName: session.activity.name,
          activitySnapshotColor: session.activity.color,
          activityDeletedSnapshot: session.activity.isDeleted,
          timerSessionId: session.id,
          startTime: part.startTime,
          endTime: part.endTime,
          durationMinutes: Math.max(1, part.durationMinutes || differenceInMinutes(part.endTime, part.startTime)),
          createdByType: "timer",
        },
      }),
    ),
  );
}

export async function fetchCurrentTimer(userId: string) {
  const session = await getActiveTimer(userId);

  if (!session) {
    return null;
  }

  const trackedMinutes = session.timeEntries.reduce((total, entry) => total + entry.durationMinutes, 0);

  return {
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    currentSegmentStartAt: session.currentSegmentStartAt,
    activity: {
      id: session.activity.id,
      name: session.activity.name,
      color: session.activity.color,
      isDeleted: session.activity.isDeleted,
    },
    trackedMinutes,
    totalMinutes: trackedMinutes,
  };
}

export async function startTimer(userId: string, activityId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await getActiveTimer(userId, tx);

    if (existing) {
      throw new ApiError(409, "Another timer is already active for this account.");
    }

    const activity = await tx.activity.findFirst({
      where: { id: activityId, userId, isDeleted: false },
    });

    if (!activity) {
      throw new ApiError(404, "The selected event could not be found.");
    }

    return tx.timerSession.create({
      data: {
        userId,
        activityId,
        status: TimerStatus.running,
        startedAt: new Date(),
        currentSegmentStartAt: new Date(),
      },
    });
  });
}

export async function pauseTimer(userId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await getActiveTimer(userId, tx);

    if (!session || session.status !== TimerStatus.running) {
      throw new ApiError(409, "There is no running timer to pause.");
    }

    const now = new Date();
    await createSegmentEntry(now, session, tx);

    return tx.timerSession.update({
      where: { id: session.id },
      data: {
        status: TimerStatus.paused,
        currentSegmentStartAt: null,
      },
    });
  });
}

export async function resumeTimer(userId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await getActiveTimer(userId, tx);

    if (!session || session.status !== TimerStatus.paused) {
      throw new ApiError(409, "There is no paused timer to resume.");
    }

    return tx.timerSession.update({
      where: { id: session.id },
      data: {
        status: TimerStatus.running,
        currentSegmentStartAt: new Date(),
      },
    });
  });
}

export async function stopTimer(userId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await getActiveTimer(userId, tx);

    if (!session) {
      throw new ApiError(409, "There is no active timer to stop.");
    }

    const now = new Date();

    if (session.status === TimerStatus.running) {
      await createSegmentEntry(now, session, tx);
    }

    return tx.timerSession.update({
      where: { id: session.id },
      data: {
        status: TimerStatus.completed,
        currentSegmentStartAt: null,
        endedAt: now,
      },
    });
  });
}
