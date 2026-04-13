"use client";

import { useMemo, useState } from "react";
import type { CategoryGroup } from "@prisma/client";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EventItem = {
  activityName: string;
  color: string;
  minutes: number;
  percentage: number;
  deleted: boolean;
  groupName: string;
};

type StatsData = {
  totalMinutes: number;
  items: EventItem[];
};

type StatsMap = {
  daily: StatsData;
  weekly: StatsData;
  monthly: StatsData;
  total: StatsData;
};

const RANGE_OPTIONS: Array<{ key: keyof StatsMap; label: string }> = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
  { key: "total", label: "Total" },
];

function renderPieLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof outerRadius !== "number" ||
    typeof midAngle !== "number" ||
    typeof percent !== "number" ||
    !name ||
    percent < 0.06
  ) {
    return null;
  }

  const radians = Math.PI / 180;
  const x1 = cx + Math.cos(-midAngle * radians) * (outerRadius + 6);
  const y1 = cy + Math.sin(-midAngle * radians) * (outerRadius + 6);
  const x2 = cx + Math.cos(-midAngle * radians) * (outerRadius + 18);
  const y2 = cy + Math.sin(-midAngle * radians) * (outerRadius + 18);
  const isRight = x2 >= cx;
  const x3 = x2 + (isRight ? 16 : -16);
  const textAnchor = isRight ? "start" : "end";

  return (
    <g>
      <path
        d={`M${x1},${y1} L${x2},${y2} L${x3},${y2}`}
        fill="none"
        stroke="rgba(91, 80, 75, 0.35)"
        strokeWidth={1}
      />
      <text
        x={x3 + (isRight ? 4 : -4)}
        y={y2}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="rgba(50, 45, 43, 0.82)"
        fontSize={11}
      >
        {String(name)}
      </text>
    </g>
  );
}

export function StatsPanel({
  stats,
  groups,
}: {
  stats: StatsMap;
  groups: CategoryGroup[];
}) {
  const [activeRange, setActiveRange] = useState<keyof StatsMap>("daily");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const data = stats[activeRange];

  const groupOptions = useMemo(() => {
    const options = groups.map((group) => group.name);
    const hasUngrouped = data.items.some((item) => item.groupName === "Ungrouped");

    return ["all", ...options, ...(hasUngrouped ? ["Ungrouped"] : [])];
  }, [data.items, groups]);

  const chartItems = useMemo(() => {
    const filtered =
      activeGroup === "all"
        ? data.items
        : data.items.filter((item) => item.groupName === activeGroup);

    const groupTotal = filtered.reduce((sum, item) => sum + item.minutes, 0);

    return filtered.map((item) => ({
      name: item.activityName,
      color: item.color,
      minutes: item.minutes,
      percentage: groupTotal ? Math.round((item.minutes / groupTotal) * 1000) / 10 : 0,
      deleted: item.deleted,
    }));
  }, [activeGroup, data.items]);

  const visibleTotal = chartItems.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <Panel className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Analytics</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {RANGE_OPTIONS.find((item) => item.key === activeRange)?.label}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap gap-3">
              {RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  variant={option.key === activeRange ? "underline" : "ghost"}
                  size="sm"
                  className="border-x-0 border-t-0 px-0"
                  onClick={() => setActiveRange(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="min-w-[190px]">
              <Select value={activeGroup} onValueChange={setActiveGroup}>
                <SelectTrigger className="rounded-none border-x-0 border-t-0 bg-transparent px-0">
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((groupName) => (
                    <SelectItem key={groupName} value={groupName}>
                      {groupName === "all" ? "All Groups" : groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--line)] pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Tracked time</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">{formatMinutes(visibleTotal)}</p>
        </div>
        <div className="space-y-3 border-t border-[var(--line)] pt-5">
          {chartItems.length > 0 ? (
            chartItems.slice(0, 8).map((item) => (
              <div key={`${item.name}-${item.color}`} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">
                    {item.name}
                    {item.deleted ? " · Deleted event" : ""}
                  </span>
                </div>
                <span className="shrink-0 text-[var(--muted)]">
                  {formatMinutes(item.minutes)} · {item.percentage}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No chart data yet.</p>
          )}
        </div>
      </div>
      <div className="min-h-[320px] border-l border-[var(--line)] pl-6">
        {chartItems.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartItems}
                dataKey="minutes"
                innerRadius={78}
                outerRadius={122}
                paddingAngle={1.5}
                strokeWidth={0}
                labelLine={false}
                label={renderPieLabel}
              >
                {chartItems.map((item) => (
                  <Cell key={`${item.name}-${item.color}`} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 0,
                  borderColor: "rgba(91, 80, 75, 0.16)",
                  backgroundColor: "rgba(255, 253, 250, 0.96)",
                  color: "rgba(50, 45, 43, 0.88)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No chart data yet.
          </div>
        )}
      </div>
    </Panel>
  );
}
