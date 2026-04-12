import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { SignInForm } from "@/components/forms/sign-in-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In | Timelane",
};

export default async function SignInPage() {
  const session = await auth();

  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
