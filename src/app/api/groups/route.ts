import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { groupSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const groups = await prisma.categoryGroup.findMany({
      where: { userId: user.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(groups);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const data = groupSchema.parse({
      ...body,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    });

    const group = await prisma.categoryGroup.create({
      data: {
        userId: user.id,
        name: data.name,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
