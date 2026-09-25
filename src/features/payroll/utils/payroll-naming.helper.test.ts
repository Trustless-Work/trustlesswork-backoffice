import { describe, expect, it } from "vitest";
import {
  buildMilestoneDescription,
  buildPayrollDescription,
  buildPayrollEngagementId,
  buildPayrollTitle,
  buildTestMilestoneDescription,
  getCurrentPayrollPeriod,
  getPayrollPeriodFromCalendarDate,
  isPayrollCalendarDay,
  isPayrollEngagementId,
  parsePayrollPeriod,
  periodToCalendarDate,
} from "@/features/payroll/utils/payroll-naming.helper";

describe("payroll-naming.helper", () => {
  const period = { year: 2026, month: 10 as const, quincena: 1 as const };

  it("builds engagement id as payroll-YYYY-MM-Qn", () => {
    expect(buildPayrollEngagementId(period)).toBe("payroll-2026-10-Q1");
    expect(
      buildPayrollEngagementId({ ...period, quincena: 2 }),
    ).toBe("payroll-2026-10-Q2");
  });

  it("builds title with quincena, month and year", () => {
    expect(buildPayrollTitle(period)).toBe(
      "Payroll - 1ra quincena - October 2026",
    );
    expect(buildPayrollTitle({ ...period, quincena: 2 })).toBe(
      "Payroll - 2da quincena - October 2026",
    );
  });

  it("builds description for the period", () => {
    expect(buildPayrollDescription(period)).toBe(
      "Team salary payments for 1ra quincena - October 2026.",
    );
  });

  it("builds milestone description with member details", () => {
    expect(
      buildMilestoneDescription(
        period,
        "Armando",
        "armando@trustlesswork.com",
      ),
    ).toBe(
      "Salary - 1ra quincena - October 2026 - Armando (armando@trustlesswork.com)",
    );
  });

  it("builds test milestone description", () => {
    expect(
      buildTestMilestoneDescription(
        period,
        "Armando",
        "armando@trustlesswork.com",
      ),
    ).toBe(
      "Test transaction - 1ra quincena - October 2026 - Armando (armando@trustlesswork.com)",
    );
  });

  it("parses a payroll engagement id with quincena", () => {
    expect(parsePayrollPeriod("payroll-2026-03-Q2")).toEqual({
      year: 2026,
      month: 3,
      quincena: 2,
    });
  });

  it("parses legacy payroll engagement ids as 1ra quincena", () => {
    expect(parsePayrollPeriod("payroll-2026-03")).toEqual({
      year: 2026,
      month: 3,
      quincena: 1,
    });
  });

  it("returns null for non-payroll engagement ids", () => {
    expect(parsePayrollPeriod("eng-multi-123")).toBeNull();
    expect(parsePayrollPeriod("")).toBeNull();
    expect(parsePayrollPeriod(null)).toBeNull();
  });

  it("detects payroll engagement prefix", () => {
    expect(isPayrollEngagementId("payroll-2026-10-Q1")).toBe(true);
    expect(isPayrollEngagementId("other")).toBe(false);
  });

  it("returns the current calendar period with quincena from day", () => {
    expect(getCurrentPayrollPeriod(new Date(2026, 8, 10))).toEqual({
      year: 2026,
      month: 9,
      quincena: 1,
    });
    expect(getCurrentPayrollPeriod(new Date(2026, 8, 24))).toEqual({
      year: 2026,
      month: 9,
      quincena: 2,
    });
  });

  it("maps a period to a representative calendar date", () => {
    expect(periodToCalendarDate(period)).toEqual(new Date(2026, 9, 1));
    expect(
      periodToCalendarDate({ ...period, quincena: 2 }),
    ).toEqual(new Date(2026, 9, 15));
  });

  it("only allows the 1st and 15th as payroll calendar days", () => {
    expect(isPayrollCalendarDay(new Date(2026, 9, 1))).toBe(true);
    expect(isPayrollCalendarDay(new Date(2026, 9, 15))).toBe(true);
    expect(isPayrollCalendarDay(new Date(2026, 9, 2))).toBe(false);
    expect(isPayrollCalendarDay(new Date(2026, 9, 16))).toBe(false);
  });

  it("maps calendar day 1 to Q1 and day 15 to Q2", () => {
    expect(getPayrollPeriodFromCalendarDate(new Date(2026, 9, 1))).toEqual({
      year: 2026,
      month: 10,
      quincena: 1,
    });
    expect(getPayrollPeriodFromCalendarDate(new Date(2026, 9, 15))).toEqual({
      year: 2026,
      month: 10,
      quincena: 2,
    });
  });
});
