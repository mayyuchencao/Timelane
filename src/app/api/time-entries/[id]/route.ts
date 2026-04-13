import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { EntrySourceType } from "@prisma/client";
import { createSplitEntries } from "@/lib/entries";
import { ApiError, handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { entryPatchSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This time entry could not be found.");
    }

    const body = await request.json();
    const data = entryPatchSchema.parse(body);
    const created = await prisma.$transaction((tx) =>
      createSplitEntries(
        {
          userId: user.id,
          activityId: data.activityId,
          startTime: data.startTime,
          endTime: data.endTime,
          note: data.note,
          timezone: user.timezone,
          createdByType: EntrySourceType.edited,
          timerSessionId: existing.timerSessionId,
          replaceEntryId: existing.id,
        },
        tx,
      ),
    );

    revalidatePath("/timeline");
    revalidatePath("/dashboard");

    return NextResponse.json(created);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This time entry could not be found.");
    }

    await prisma.timeEntry.delete({ where: { id } });
    revalidatePath("/timeline");
    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
