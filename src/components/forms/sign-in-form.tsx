"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch {
      toast.error("We couldn't send the magic link. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-12">
      <div className="w-full border-y border-[var(--line)] py-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--foreground)]">TIMELANE</p>
        </div>
        <form onSubmit={onSubmit} className="max-w-xl">
          <div className="mb-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Magic Link sign in</p>
            <h2 className="text-2xl font-semibold tracking-tight">Use your email to enter Timelane</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              We&apos;ll send a secure sign-in link to your inbox. One email address always maps to one personal account.
            </p>
          </div>
          <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Email</label>
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button className="mt-5 border-x-0 border-t-0 px-0" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send magic link
          </Button>
        </form>
      </div>
    </div>
  );
}
