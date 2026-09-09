import type {
  EscrowFinancial,
  EscrowSummary,
} from "@trustless-work/escrow";
import type {
  DashboardAttentionItem,
  DashboardBudgetSegment,
  DashboardCreatedPoint,
  DashboardMetrics,
  DashboardNextRelease,
  DashboardStat,
  DashboardVolumePoint,
} from "@/features/dashboard/types/dashboard.types";
import {
  formatCompactCurrency,
  formatFullCurrency,
  formatInteger,
} from "@/helpers/chart-format.helper";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

const BUDGET_COLORS = {
  locked: "var(--chart-2)",
  released: "var(--chart-3)",
  pending: "var(--chart-4)",
} as const;

export function parseDashboardAmount(
  value: string | number | null | undefined,
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toIsoCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysAgoIso(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

export function buildLastNDayKeys(days: number, now = new Date()): string[] {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    keys.push(toIsoCalendarDate(new Date(end.getTime() - offset * DAY_MS)));
  }
  return keys;
}

function calendarDayFromIso(iso: string): string {
  if (iso.length >= 10) {
    return iso.slice(0, 10);
  }
  return toIsoCalendarDate(new Date(iso));
}

function percentDelta(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

function periodGrowthPct(values: readonly number[]): number {
  const first = values[0] ?? 0;
  const last = values.at(-1) ?? 0;
  if (first === 0) {
    return last === 0 ? 0 : 100;
  }
  return ((last - first) / first) * 100;
}

function sumBy<T>(items: readonly T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

function financialMap(
  financials: readonly EscrowFinancial[],
): Map<string, EscrowFinancial> {
  const map = new Map<string, EscrowFinancial>();
  for (const row of financials) {
    map.set(row.contractId, row);
  }
  return map;
}

function resolveBalance(
  summary: EscrowSummary,
  financial: EscrowFinancial | undefined,
): number {
  if (financial) {
    return parseDashboardAmount(financial.balance);
  }
  return parseDashboardAmount(summary.balance);
}

function resolveDealSize(
  summary: EscrowSummary,
  financial: EscrowFinancial | undefined,
): number {
  if (financial) {
    const deposited = parseDashboardAmount(financial.totalDeposited);
    if (deposited > 0) {
      return deposited;
    }
    return parseDashboardAmount(financial.totalAmount);
  }

  if (summary.totalAmount != null) {
    return parseDashboardAmount(summary.totalAmount);
  }

  return parseDashboardAmount(summary.balance);
}

function buildVolumeSeries(
  escrows: readonly EscrowSummary[],
  byFinancial: Map<string, EscrowFinancial>,
  dayKeys: readonly string[],
): DashboardVolumePoint[] {
  const daily = new Map<string, number>(dayKeys.map((key) => [key, 0]));

  for (const escrow of escrows) {
    const day = calendarDayFromIso(escrow.createdAt);
    if (!daily.has(day)) {
      continue;
    }
    const amount = resolveBalance(escrow, byFinancial.get(escrow.contractId));
    daily.set(day, (daily.get(day) ?? 0) + amount);
  }

  return dayKeys.map((date) => ({
    date,
    volume: daily.get(date) ?? 0,
  }));
}

function buildCreatedSeries(
  escrows: readonly EscrowSummary[],
  dayKeys: readonly string[],
): {
  series: DashboardCreatedPoint[];
  peakDate: string | null;
  total: number;
} {
  const daily = new Map<string, number>(dayKeys.map((key) => [key, 0]));

  for (const escrow of escrows) {
    const day = calendarDayFromIso(escrow.createdAt);
    if (!daily.has(day)) {
      continue;
    }
    daily.set(day, (daily.get(day) ?? 0) + 1);
  }

  let peakDate: string | null = null;
  let peakCount = -1;
  for (const date of dayKeys) {
    const count = daily.get(date) ?? 0;
    if (count > peakCount) {
      peakCount = count;
      peakDate = date;
    }
  }

  if (peakCount <= 0) {
    peakDate = null;
  }

  const series = dayKeys.map((date) => ({
    date,
    orders: daily.get(date) ?? 0,
    isPeak: peakDate !== null && date === peakDate,
  }));

  return {
    series,
    peakDate,
    total: sumBy(series, (row) => row.orders),
  };
}

function buildBudgetSegments(
  locked: number,
  released: number,
  pending: number,
): { total: number; segments: DashboardBudgetSegment[] } {
  const total = locked + released + pending;
  if (total <= 0) {
    return {
      total: 0,
      segments: [
        { pct: 34, label: "Locked", color: BUDGET_COLORS.locked },
        { pct: 33, label: "Released", color: BUDGET_COLORS.released },
        { pct: 33, label: "Pending", color: BUDGET_COLORS.pending },
      ],
    };
  }

  const lockedPct = Math.round((locked / total) * 100);
  const releasedPct = Math.round((released / total) * 100);
  const pendingPct = Math.max(0, 100 - lockedPct - releasedPct);

  return {
    total,
    segments: [
      { pct: lockedPct, label: "Locked", color: BUDGET_COLORS.locked },
      { pct: releasedPct, label: "Released", color: BUDGET_COLORS.released },
      { pct: pendingPct, label: "Pending", color: BUDGET_COLORS.pending },
    ],
  };
}

function buildNextRelease(
  financials: readonly EscrowFinancial[],
): DashboardNextRelease {
  let best: EscrowFinancial | null = null;
  let bestAmount = -1;

  for (const row of financials) {
    if (!row.nextRelease) {
      continue;
    }
    const amount = parseDashboardAmount(row.nextRelease.amount);
    if (amount > bestAmount) {
      bestAmount = amount;
      best = row;
    }
  }

  if (!best?.nextRelease) {
    return {
      dateIso: null,
      amount: 0,
      contractId: null,
      milestoneIndex: null,
      statusLabel: "None scheduled",
    };
  }

  return {
    dateIso: null,
    amount: parseDashboardAmount(best.nextRelease.amount),
    contractId: best.contractId,
    milestoneIndex: best.nextRelease.milestoneIndex,
    statusLabel: "Pending",
  };
}

function buildAttention(
  escrows: readonly EscrowSummary[],
  byFinancial: Map<string, EscrowFinancial>,
): DashboardAttentionItem[] {
  let disputed = 0;
  let pendingRelease = 0;
  let unfunded = 0;
  let active = 0;
  let released = 0;

  for (const escrow of escrows) {
    if (escrow.status === "disputed") {
      disputed += 1;
    }
    if (escrow.status === "active") {
      active += 1;
    }
    if (escrow.status === "released") {
      released += 1;
    }

    const financial = byFinancial.get(escrow.contractId);
    if (parseDashboardAmount(financial?.pendingRelease) > 0) {
      pendingRelease += 1;
    }

    if (
      escrow.status === "active" &&
      resolveBalance(escrow, financial) <= 0
    ) {
      unfunded += 1;
    }
  }

  return [
    {
      id: "disputed",
      title: "Disputed escrows",
      href: "/dashboard/escrows?status=disputed",
      count: disputed,
      icon: "dispute",
    },
    {
      id: "pending-release",
      title: "Pending release",
      href: "/dashboard/escrows?status=active",
      count: pendingRelease,
      icon: "pending",
    },
    {
      id: "unfunded",
      title: "Unfunded active",
      href: "/dashboard/escrows?status=active",
      count: unfunded,
      icon: "unfunded",
    },
    {
      id: "active",
      title: "Active escrows",
      href: "/dashboard/escrows?status=active",
      count: active,
      icon: "active",
    },
    {
      id: "released",
      title: "Released escrows",
      href: "/dashboard/escrows?status=released",
      count: released,
      icon: "released",
    },
  ];
}

function buildStats(
  escrows: readonly EscrowSummary[],
  byFinancial: Map<string, EscrowFinancial>,
  lockedBalance: number,
): DashboardStat[] {
  const activeCount = escrows.filter((row) => row.status === "active").length;
  const dealSizes = escrows.map((row) =>
    resolveDealSize(row, byFinancial.get(row.contractId)),
  );
  const avgDeal =
    dealSizes.length > 0
      ? sumBy(dealSizes, (value) => value) / dealSizes.length
      : 0;

  const midpoint = Math.floor(escrows.length / 2);
  const recent = escrows.slice(0, midpoint);
  const older = escrows.slice(midpoint);
  const recentActive = recent.filter((row) => row.status === "active").length;
  const olderActive = older.filter((row) => row.status === "active").length;
  const recentLocked = sumBy(recent, (row) =>
    resolveBalance(row, byFinancial.get(row.contractId)),
  );
  const olderLocked = sumBy(older, (row) =>
    resolveBalance(row, byFinancial.get(row.contractId)),
  );
  const recentAvg =
    recent.length > 0
      ? sumBy(recent, (row) =>
          resolveDealSize(row, byFinancial.get(row.contractId)),
        ) / recent.length
      : 0;
  const olderAvg =
    older.length > 0
      ? sumBy(older, (row) =>
          resolveDealSize(row, byFinancial.get(row.contractId)),
        ) / older.length
      : 0;

  return [
    {
      label: "Active escrows",
      value: formatInteger(activeCount),
      delta: percentDelta(recentActive, olderActive),
      hint: "vs prior window",
    },
    {
      label: "Locked balance",
      value: formatCompactCurrency(lockedBalance),
      delta: percentDelta(recentLocked, olderLocked),
      hint: "vs prior window",
    },
    {
      label: "Avg deal size",
      value: formatFullCurrency(avgDeal),
      delta: percentDelta(recentAvg, olderAvg),
      hint: "vs prior window",
    },
  ];
}

export function createEmptyDashboardMetrics(
  now = new Date(),
): DashboardMetrics {
  const dayKeys = buildLastNDayKeys(WINDOW_DAYS, now);
  const volumeSeries = dayKeys.map((date) => ({ date, volume: 0 }));
  const created = buildCreatedSeries([], dayKeys);
  const budget = buildBudgetSegments(0, 0, 0);

  return {
    stats: [
      {
        label: "Active escrows",
        value: formatInteger(0),
        delta: 0,
        hint: "vs prior window",
      },
      {
        label: "Locked balance",
        value: formatCompactCurrency(0),
        delta: 0,
        hint: "vs prior window",
      },
      {
        label: "Avg deal size",
        value: formatFullCurrency(0),
        delta: 0,
        hint: "vs prior window",
      },
    ],
    volumeSeries,
    volumeLatest: 0,
    volumeDeltaPct: 0,
    insightPendingReleasePct: 0,
    budgetTotal: 0,
    budgetSegments: budget.segments,
    createdSeries: created.series,
    createdTotal: 0,
    createdDeltaPct: 0,
    createdPeakDate: null,
    totalDeposited: 0,
    releasedShare: 0,
    typeMix: {
      total: 0,
      singleRelease: 0,
      multiRelease: 0,
    },
    nextRelease: {
      dateIso: null,
      amount: 0,
      contractId: null,
      milestoneIndex: null,
      statusLabel: "None scheduled",
    },
    platformFeesTotal: 0,
    attention: buildAttention([], new Map()),
  };
}

export function aggregateDashboardMetrics(input: {
  escrows: readonly EscrowSummary[];
  financials: readonly EscrowFinancial[];
  now?: Date;
}): DashboardMetrics {
  const now = input.now ?? new Date();
  const dayKeys = buildLastNDayKeys(WINDOW_DAYS, now);
  const byFinancial = financialMap(input.financials);

  if (input.escrows.length === 0) {
    return createEmptyDashboardMetrics(now);
  }

  const lockedBalance = sumBy(input.escrows, (row) =>
    resolveBalance(row, byFinancial.get(row.contractId)),
  );
  const totalDeposited = sumBy(input.financials, (row) =>
    parseDashboardAmount(row.totalDeposited),
  );
  const totalReleased = sumBy(input.financials, (row) =>
    parseDashboardAmount(row.totalReleased),
  );
  const pendingRelease = sumBy(input.financials, (row) =>
    parseDashboardAmount(row.pendingRelease),
  );
  const platformFeesTotal = sumBy(input.financials, (row) =>
    parseDashboardAmount(row.platformFee),
  );

  const volumeSeries = buildVolumeSeries(input.escrows, byFinancial, dayKeys);
  const created = buildCreatedSeries(input.escrows, dayKeys);
  const budget = buildBudgetSegments(
    lockedBalance,
    totalReleased,
    pendingRelease,
  );

  const depositedBase = totalDeposited > 0 ? totalDeposited : lockedBalance;
  const insightPendingReleasePct =
    depositedBase > 0 ? (pendingRelease / depositedBase) * 100 : 0;

  const singleRelease = input.escrows.filter(
    (row) => row.type === "single-release",
  ).length;
  const multiRelease = input.escrows.length - singleRelease;

  const firstHalfCreated = sumBy(
    created.series.slice(0, Math.floor(created.series.length / 2)),
    (row) => row.orders,
  );
  const secondHalfCreated = sumBy(
    created.series.slice(Math.floor(created.series.length / 2)),
    (row) => row.orders,
  );

  return {
    stats: buildStats(input.escrows, byFinancial, lockedBalance),
    volumeSeries,
    volumeLatest: lockedBalance,
    volumeDeltaPct: periodGrowthPct(volumeSeries.map((row) => row.volume)),
    insightPendingReleasePct,
    budgetTotal: budget.total,
    budgetSegments: budget.segments,
    createdSeries: created.series,
    createdTotal: created.total,
    createdDeltaPct: percentDelta(secondHalfCreated, firstHalfCreated),
    createdPeakDate: created.peakDate,
    totalDeposited: totalDeposited > 0 ? totalDeposited : lockedBalance,
    releasedShare:
      totalDeposited > 0
        ? totalReleased / totalDeposited
        : totalReleased + lockedBalance > 0
          ? totalReleased / (totalReleased + lockedBalance)
          : 0,
    typeMix: {
      total: input.escrows.length,
      singleRelease,
      multiRelease,
    },
    nextRelease: buildNextRelease(input.financials),
    platformFeesTotal,
    attention: buildAttention(input.escrows, byFinancial),
  };
}
