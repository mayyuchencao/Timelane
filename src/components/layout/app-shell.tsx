import Link from "next/link";
import { CalendarRange, Clock3, LayoutDashboard, Settings, Shapes } from "lucide-react";
import type { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/layout/sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: CalendarRange },
  { href: "/activities", label: "Activities", icon: Shapes },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-8 px-6 py-6 lg:px-8">
        <aside className="hidden w-[220px] shrink-0 border-r border-[var(--line)] pr-6 md:flex md:flex-col">
          <div className="pb-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-[var(--muted)]" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Personal Time</p>
                <h1 className="text-xl font-semibold tracking-tight">Timelane</h1>
              </div>
            </div>
          </div>
          <Separator />
          <nav className="mt-5 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.href} asChild variant="ghost" className="justify-start border-x-0 border-t-0 px-0 py-3">
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <Separator />
          <div className="pt-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Signed in</p>
            <p className="mt-2 font-medium">{user.displayName || "You"}</p>
            <p className="text-sm text-[var(--muted)]">{user.email}</p>
            <SignOutButton className="mt-5 border-x-0 border-t-0 px-0" />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="mb-6 flex flex-col gap-5 border-b border-[var(--line)] pb-4 md:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Timelane</p>
                <h1 className="text-xl font-semibold">{user.displayName || "You"}</h1>
              </div>
              <SignOutButton className="border-x-0 border-t-0 px-0" />
            </div>
            <div className="flex flex-wrap gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button key={item.href} asChild variant="ghost" size="sm" className="border-x-0 border-t-0 px-0">
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
