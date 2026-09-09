import { formatMonthKey } from "@/helpers/month-key.helper";

export type PeriodGranularity = "day" | "week" | "month";

const DAY_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDayKey(dayKey: string, style: "short" | "full"): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!match) {
    return dayKey;
  }

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const monthLabel = DAY_LABELS[monthIndex];
  if (!monthLabel) {
    return dayKey;
  }

  return style === "full"
    ? `${monthLabel} ${day}, ${year}`
    : `${monthLabel} ${day}`;
}

/** Format a UTC bucket key for charts and tables. */
export function formatPeriodKey(
  periodKey: string,
  granularity: PeriodGranularity,
  style: "short" | "full" = "short",
): string {
  if (granularity === "month") {
    return formatMonthKey(periodKey, style);
  }

  if (granularity === "day") {
    return formatDayKey(periodKey, style);
  }

  const weekLabel = formatDayKey(periodKey, style);
  return style === "full" ? `Week of ${weekLabel}` : weekLabel;
}

/** Human label for bucket-over-bucket growth hints. */
export function growthHintLabel(granularity: PeriodGranularity): string {
  switch (granularity) {
    case "day":
      return "day over day";
    case "week":
      return "week over week";
    default:
      return "month over month";
  }
}
