import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { groupSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await request.json();
    const data = groupSchema.parse({
      ...body,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    });
    const existing = await prisma.categoryGroup.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This group could not be found.");
    }

    const group = await prisma.categoryGroup.update({
      where: { id },
      data,
    });

    return NextResponse.json(group);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await prisma.categoryGroup.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new ApiError(404, "This group could not be found.");
    }

    await prisma.$transaction([
      prisma.activity.updateMany({
        where: { userId: user.id, groupId: id },
        data: { groupId: null },
      }),
      prisma.categoryGroup.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
