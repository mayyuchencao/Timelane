import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { activitySchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const activities = await prisma.activity.findMany({
      where: { userId: user.id, isDeleted: false },
      include: { group: true },
      orderBy: [{ name: "asc" }],
    });
    return NextResponse.json(activities);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const data = activitySchema.parse({
      ...body,
      groupId: body.groupId || null,
    });

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        name: data.name,
        color: data.color,
        groupId: data.groupId ?? null,
      },
      include: { group: true },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
