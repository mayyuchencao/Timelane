import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "America/New_York";

export function getNow() {
  return new Date();
}

export function toUtcFromLocalInput(input: string, timezone: string) {
  return fromZonedTime(input, timezone);
}

export function formatLocal(date: Date | string, timezone: string, pattern: string) {
  return formatInTimeZone(date, timezone, pattern);
}

export function getDateRangeBounds(anchorDate: Date, timezone: string) {
  const zoned = toZonedTime(anchorDate, timezone);
  const start = startOfDay(zoned);
  const end = endOfDay(addDays(start, 6));

  return {
    startUtc: fromZonedTime(start, timezone),
    endUtc: fromZonedTime(end, timezone),
    days: eachDayOfInterval({ start, end }),
  };
}

export function getPeriodRange(period: "daily" | "weekly" | "monthly" | "total", timezone: string) {
  const now = toZonedTime(new Date(), timezone);

  if (period === "total") {
    return null;
  }

  if (period === "daily") {
    return {
      start: fromZonedTime(startOfDay(now), timezone),
      end: fromZonedTime(endOfDay(now), timezone),
    };
  }

  if (period === "weekly") {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return { start: fromZonedTime(start, timezone), end: fromZonedTime(end, timezone) };
  }

  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return { start: fromZonedTime(start, timezone), end: fromZonedTime(end, timezone) };
}

export function splitRangeByDay(startUtc: Date, endUtc: Date, timezone: string) {
  const startLocal = toZonedTime(startUtc, timezone);
  const endLocal = toZonedTime(endUtc, timezone);

  if (startLocal >= endLocal) {
    return [];
  }

  const parts: Array<{ startTime: Date; endTime: Date; durationMinutes: number }> = [];
  let cursor = startLocal;

  while (cursor < endLocal) {
    const dayEnd = endOfDay(cursor);
    const segmentEndLocal = dayEnd < endLocal ? dayEnd : endLocal;
    const actualEndLocal = segmentEndLocal < endLocal ? addDays(startOfDay(segmentEndLocal), 1) : segmentEndLocal;
    const segmentStartUtc = fromZonedTime(cursor, timezone);
    const segmentEndUtc = fromZonedTime(actualEndLocal, timezone);

    parts.push({
      startTime: segmentStartUtc,
      endTime: segmentEndUtc,
      durationMinutes: differenceInMinutes(segmentEndUtc, segmentStartUtc),
    });

    cursor = actualEndLocal;
  }

  return parts.filter((part) => part.durationMinutes > 0);
}

export function getHourLabel(hour: number) {
  const normalized = hour % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const base = normalized % 12 || 12;
  return `${base} ${suffix}`;
}
