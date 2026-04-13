"use client";

import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Option = {
  value: string;
  label: string;
};

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyLabel = "No matches found.",
  disabled = false,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-3 border-b border-[var(--line)] bg-transparent px-0 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-[var(--muted)]")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={10}
          align="start"
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[220px] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] backdrop-blur"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 rounded-none border-x-0 border-t-0 bg-transparent pl-9 pr-0"
              autoFocus
            />
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto thin-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 border-b border-[var(--line)] py-2 text-left text-sm transition last:border-b-0 hover:text-[var(--foreground)]"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--muted)] transition",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              ))
            ) : (
              <p className="py-2 text-sm text-[var(--muted)]">{emptyLabel}</p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
