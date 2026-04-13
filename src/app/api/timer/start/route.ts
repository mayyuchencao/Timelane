import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";
import { timerStartSchema } from "@/lib/validators";
import { startTimer } from "@/lib/timer";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const data = timerStartSchema.parse(body);
    const session = await startTimer(user.id, data.activityId);
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
