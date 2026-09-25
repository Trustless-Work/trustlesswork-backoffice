export const PAYROLL_ENGAGEMENT_PREFIX = "payroll-";

export const PAYROLL_PLATFORM_FEE = 0;

/** Extra 1 USDC milestone per member for a visible test transaction. */
export const PAYROLL_TEST_MILESTONE_AMOUNT = 1;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
