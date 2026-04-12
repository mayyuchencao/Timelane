"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        richColors={false}
        toastOptions={{
          className:
            "!border-[var(--line)] !bg-white/90 !text-[var(--foreground)] !shadow-[var(--shadow)]",
        }}
      />
    </SessionProvider>
  );
}
