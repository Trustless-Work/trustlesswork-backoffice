import {
  MONTH_NAMES,
  PAYROLL_ENGAGEMENT_PREFIX,
  type MonthIndex,
} from "@/features/payroll/constants/payroll.constants";

export const PAYROLL_QUINCENAS = [1, 2] as const;

export type PayrollQuincena = (typeof PAYROLL_QUINCENAS)[number];

export type PayrollPeriod = {
  readonly year: number;
  readonly month: MonthIndex;
  readonly quincena: PayrollQuincena;
};

function padMonth(month: number): string {
  return String(month).padStart(2, "0");
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? `Month ${month}`;
}

export function getQuincenaLabel(quincena: PayrollQuincena): string {
  return quincena === 1 ? "1ra quincena" : "2da quincena";
}

export function formatPayrollPeriodLabel(period: PayrollPeriod): string {
  return `${getQuincenaLabel(period.quincena)} - ${getMonthName(period.month)} ${period.year}`;
}

export function buildPayrollEngagementId(period: PayrollPeriod): string {
  return `${PAYROLL_ENGAGEMENT_PREFIX}${period.year}-${padMonth(period.month)}-Q${period.quincena}`;
}

export function buildPayrollTitle(period: PayrollPeriod): string {
  return `Payroll - ${formatPayrollPeriodLabel(period)}`;
}

export function buildPayrollDescription(period: PayrollPeriod): string {
  return `Team salary payments for ${formatPayrollPeriodLabel(period)}.`;
}

export function buildMilestoneDescription(
  period: PayrollPeriod,
  displayName: string,
  email: string,
): string {
  return `Salary - ${formatPayrollPeriodLabel(period)} - ${displayName} (${email})`;
}

export function buildTestMilestoneDescription(
  period: PayrollPeriod,
  displayName: string,
  email: string,
): string {
  return `Test transaction - ${formatPayrollPeriodLabel(period)} - ${displayName} (${email})`;
}

/**
 * Parses `payroll-YYYY-MM-Q1|Q2` (current) or legacy `payroll-YYYY-MM`.
 */
export function parsePayrollPeriod(
  engagementId: string | null | undefined,
): PayrollPeriod | null {
  if (!engagementId) {
    return null;
  }

  const trimmed = engagementId.trim();
  const withQuincena = trimmed.match(/^payroll-(\d{4})-(\d{2})-Q([12])$/);
  const legacy = trimmed.match(/^payroll-(\d{4})-(\d{2})$/);

  const match = withQuincena ?? legacy;
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const quincena = withQuincena
    ? (Number(withQuincena[3]) as PayrollQuincena)
    : 1;

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { year, month: month as MonthIndex, quincena };
}

export function getCurrentPayrollPeriod(now = new Date()): PayrollPeriod {
  const day = now.getDate();

  return {
    year: now.getFullYear(),
    month: (now.getMonth() + 1) as MonthIndex,
    quincena: day <= 15 ? 1 : 2,
  };
}

/** Quincena from an allowed payroll calendar day (1 → Q1, 15 → Q2). */
export function getPayrollPeriodFromCalendarDate(date: Date): PayrollPeriod {
  const day = date.getDate();
  const quincena: PayrollQuincena = day === 1 ? 1 : 2;

  return {
    year: date.getFullYear(),
    month: (date.getMonth() + 1) as MonthIndex,
    quincena,
  };
}

export function isPayrollCalendarDay(date: Date): boolean {
  const day = date.getDate();
  return day === 1 || day === 15;
}

/** Representative calendar date for a period (1st = Q1, 15th = Q2). */
export function periodToCalendarDate(period: PayrollPeriod): Date {
  const day = period.quincena === 1 ? 1 : 15;
  return new Date(period.year, period.month - 1, day);
}

export function isPayrollEngagementId(
  engagementId: string | null | undefined,
): boolean {
  return Boolean(
    engagementId?.trim().startsWith(PAYROLL_ENGAGEMENT_PREFIX),
  );
}
