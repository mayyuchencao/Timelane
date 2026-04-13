import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { requireApiUser } from "@/lib/session";
import { stopTimer } from "@/lib/timer";

export async function POST() {
  try {
    const user = await requireApiUser();
    const session = await stopTimer(user.id);
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    return NextResponse.json(session);
  } catch (error) {
    return handleRouteError(error);
  }
}
