import { redirect } from "next/navigation";
import { FirstRunForm } from "@/components/forms/first-run-form";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FirstRunPage() {
  const user = await requireUser();

  if (user.displayName) {
    redirect("/dashboard");
  }

  return <FirstRunForm user={user} />;
}
