const MONTH_LABELS = [
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

/** Format a UTC month key (`YYYY-MM`) without using `Date` parsing. */
export function formatMonthKey(
  monthKey: string,
  style: "short" | "full" = "short",
): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) {
    return monthKey;
  }

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const label = MONTH_LABELS[monthIndex];
  if (!label) {
    return monthKey;
  }

  return style === "full" ? `${label} ${year}` : label;
}

/** Build a continuous list of UTC month keys ending at the latest month in data. */
export function buildMonthRange(
  monthKeys: readonly string[],
  months: number,
): string[] {
  if (monthKeys.length === 0) {
    return [];
  }

  const sorted = [...monthKeys].sort();
  const endKey = sorted[sorted.length - 1] ?? "";
  const endMatch = /^(\d{4})-(\d{2})$/.exec(endKey);
  if (!endMatch) {
    return sorted;
  }

  let year = Number(endMatch[1]);
  let month = Number(endMatch[2]);
  const result: string[] = [];

  for (let index = 0; index < months; index += 1) {
    result.unshift(
      `${year}-${String(month).padStart(2, "0")}`,
    );
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }

  return result;
}
