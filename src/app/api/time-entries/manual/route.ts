import { NextRequest, NextResponse } from "next/server";
import { EntrySourceType } from "@prisma/client";
import { createSplitEntries } from "@/lib/entries";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { manualEntrySchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const data = manualEntrySchema.parse(body);
    const entries = await prisma.$transaction((tx) =>
      createSplitEntries(
        {
          userId: user.id,
          activityId: data.activityId,
          startTime: data.startTime,
          endTime: data.endTime,
          note: data.note,
          timezone: user.timezone,
          createdByType: EntrySourceType.manual,
        },
        tx,
      ),
    );

    return NextResponse.json(entries, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
