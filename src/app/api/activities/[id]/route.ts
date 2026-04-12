import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { activitySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await request.json();
    const data = activitySchema.parse({
      ...body,
      groupId: body.groupId || null,
    });
    const existing = await prisma.activity.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This event could not be found.");
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        groupId: data.groupId ?? null,
      },
      include: { group: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await prisma.activity.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This event could not be found.");
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    return handleRouteError(error);
  }
}
