import { NextResponse } from "next/server";
import { fetchCurrentTimer } from "@/lib/timer";
import { handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireApiUser();
    const timer = await fetchCurrentTimer(user.id);
    return NextResponse.json(timer);
  } catch (error) {
    return handleRouteError(error);
  }
}
