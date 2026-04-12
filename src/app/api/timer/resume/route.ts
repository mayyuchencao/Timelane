import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";
import { resumeTimer } from "@/lib/timer";

export async function POST() {
  try {
    const user = await requireApiUser();
    const session = await resumeTimer(user.id);
    return NextResponse.json(session);
  } catch (error) {
    return handleRouteError(error);
  }
}
