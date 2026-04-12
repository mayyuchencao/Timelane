import { z } from "zod";
import { CANDY_COLOR_VALUES } from "@/lib/constants/colors";

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required.").max(60, "Display name is too long."),
  timezone: z.string().trim().min(1, "Timezone is required."),
});

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required.").max(60, "Group name is too long."),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export const activitySchema = z.object({
  name: z.string().trim().min(1, "Event name is required.").max(80, "Event name is too long."),
  groupId: z.string().cuid().nullable().optional(),
  color: z.string().refine((value) => CANDY_COLOR_VALUES.has(value), "Please choose one of the preset colors."),
});

export const manualEntrySchema = z.object({
  activityId: z.string().cuid("Please choose an event."),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  note: z.string().trim().max(280, "Note is too long.").nullable().optional(),
});

export const timerStartSchema = z.object({
  activityId: z.string().cuid("Please choose an event."),
});

export const entryPatchSchema = z.object({
  activityId: z.string().cuid("Please choose an event."),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  note: z.string().trim().max(280, "Note is too long.").nullable().optional(),
});

export function normalizeOptionalNote(note?: string | null) {
  const trimmed = note?.trim();
  return trimmed ? trimmed : null;
}
