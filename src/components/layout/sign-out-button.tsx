"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button className={className} variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
