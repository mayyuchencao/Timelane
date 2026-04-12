import { NextRequest, NextResponse } from "next/server";
import { getStatsForPeriod } from "@/lib/stats";
import { ApiError, handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";

type Params = { params: Promise<{ period: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { period } = await params;

    if (!["daily", "weekly", "monthly", "total"].includes(period)) {
      throw new ApiError(404, "This stats range is not supported.");
    }

    const stats = await getStatsForPeriod(user.id, user.timezone, period as "daily" | "weekly" | "monthly" | "total");
    return NextResponse.json(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
