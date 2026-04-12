import { NextResponse } from "next/server";
import { getStatsForPeriod } from "@/lib/stats";
import { handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireApiUser();
    const stats = await getStatsForPeriod(user.id, user.timezone, "total");
    return NextResponse.json(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
