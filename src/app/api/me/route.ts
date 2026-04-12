import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      timezone: user.timezone,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const data = profileSchema.parse(body);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName,
        name: data.displayName,
        timezone: data.timezone,
      },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      timezone: updated.timezone,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
