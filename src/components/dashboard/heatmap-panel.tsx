"use client";

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
  "rgba(120, 88, 162, 0.08)",
  "#eadcf8",
  "#d2b7ef",
  "#b184de",
  "#7a4cc2",
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
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px] space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div />
              <div
                className="grid gap-1 text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              >
                {monthLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="truncate">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="grid gap-1 pt-[2px] text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
                  <span key={`${label}-${index}`} className="flex h-3.5 items-center pr-2">
                    {DAY_LABELS.includes(label) ? label : ""}
                  </span>
                ))}
              </div>
              <div
                className="grid auto-cols-fr grid-flow-col gap-1"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid gap-1">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.minutes > 0 ? formatMinutes(day.minutes) : "No tracked time"} on ${day.tooltipLabel}`}
                        className="h-3.5 w-3.5 border border-[rgba(122,76,194,0.15)]"
                        style={{
                          backgroundColor: day.isInRange ? HEATMAP_COLORS[day.level] : "transparent",
                          opacity: day.isInRange ? 1 : 0.22,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
          <p>Every square marks a day from the past year.</p>
          <div className="flex items-center gap-2">
            <span>Less</span>
            {HEATMAP_COLORS.map((color, index) => (
              <span
                key={`legend-${index}`}
                className="h-3.5 w-3.5 border border-[rgba(122,76,194,0.15)]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
