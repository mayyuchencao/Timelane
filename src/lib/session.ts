import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireApiUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new ApiError(401, "Please sign in to continue.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new ApiError(401, "Please sign in to continue.");
  }

  return user;
}
