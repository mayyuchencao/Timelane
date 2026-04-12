import type * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "border-y border-[var(--line)] bg-transparent px-0 py-6",
        className,
      )}
      {...props}
    />
  );
}
