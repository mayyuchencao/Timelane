import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        ...(start ? { startTime: { gte: new Date(start) } } : {}),
        ...(end ? { endTime: { lte: new Date(end) } } : {}),
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    return handleRouteError(error);
  }
}
