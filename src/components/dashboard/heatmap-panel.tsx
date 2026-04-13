"use client";

import type { CSSProperties } from "react";
import { eachWeekOfInterval, format, parseISO, startOfWeek } from "date-fns";
import { formatMinutes } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

type HeatmapDay = {
  date: string;
  minutes: number;
  level: number;
  isInRange: boolean;
  dayLabel: string;
  monthLabel: string;
  tooltipLabel: string;
};

const DAY_LABELS = ["Mon", "Wed", "Fri"];
const HEATMAP_COLORS = [
  "rgba(244, 166, 184, 0.07)",
  "#f8dee7",
  "#f5c6d7",
  "#eda8c2",
  "#dc7fa5",
];

function getMonthLabels(days: HeatmapDay[]) {
  const firstDay = parseISO(days[0].date);
  const lastDay = parseISO(days[days.length - 1].date);
  const weekStarts = eachWeekOfInterval(
    {
      start: startOfWeek(firstDay, { weekStartsOn: 0 }),
      end: lastDay,
    },
    { weekStartsOn: 0 },
  );

  let previousMonth = "";

  return weekStarts.map((weekStart) => {
    const monthLabel = format(weekStart, "MMM");
    const currentMonthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;

    if (currentMonthKey === previousMonth) {
      return "";
    }

    previousMonth = currentMonthKey;
    return monthLabel;
  });
}

export function HeatmapPanel({
  heatmap,
}: {
  heatmap: { totalMinutes: number; maxMinutes: number; days: HeatmapDay[] };
}) {
  const monthLabels = getMonthLabels(heatmap.days);
  const weeks = Array.from({ length: Math.ceil(heatmap.days.length / 7) }, (_, index) =>
    heatmap.days.slice(index * 7, index * 7 + 7),
  );
  const gridStyle = {
    ["--heatmap-cell" as string]: "clamp(0.38rem, 0.62vw, 0.56rem)",
    ["--heatmap-gap" as string]: "clamp(0.14rem, 0.22vw, 0.22rem)",
  } as CSSProperties;

  return (
    <Panel className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Rhythm</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Daily study heatmap</h2>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Last year</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{formatMinutes(heatmap.totalMinutes)}</p>
        </div>
      </div>

      <div className="border-t border-[var(--line)] pt-5">
        <div className="space-y-3" style={gridStyle}>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div />
              <div
                className="grid text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase"
                style={{
                  gap: "var(--heatmap-gap)",
                  gridTemplateColumns: `repeat(${weeks.length}, var(--heatmap-cell))`,
                }}
              >
                {monthLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="truncate">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div
                className="grid pt-[2px] text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]"
                style={{ gap: "var(--heatmap-gap)" }}
              >
                {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="flex items-center pr-2"
                    style={{ height: "var(--heatmap-cell)" }}
                  >
                    {DAY_LABELS.includes(label) ? label : ""}
                  </span>
                ))}
              </div>
              <div
                className="grid justify-start"
                style={{
                  gap: "var(--heatmap-gap)",
                  gridTemplateColumns: `repeat(${weeks.length}, var(--heatmap-cell))`,
                }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid" style={{ gap: "var(--heatmap-gap)" }}>
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.minutes > 0 ? formatMinutes(day.minutes) : "No tracked time"} on ${day.tooltipLabel}`}
                        className="border"
                        style={{
                          width: "var(--heatmap-cell)",
                          height: "var(--heatmap-cell)",
                          backgroundColor: day.isInRange ? HEATMAP_COLORS[day.level] : "transparent",
                          borderColor: "rgba(220, 127, 165, 0.18)",
                          opacity: day.isInRange ? 1 : 0.22,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
          <p>Every square marks a day from the past year, excluding deleted events.</p>
          <div className="flex items-center gap-2">
            <span>Less</span>
            {HEATMAP_COLORS.map((color, index) => (
              <span
                key={`legend-${index}`}
                className="border"
                style={{
                  width: "var(--heatmap-cell)",
                  height: "var(--heatmap-cell)",
                  borderColor: "rgba(220, 127, 165, 0.18)",
                  backgroundColor: color,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
