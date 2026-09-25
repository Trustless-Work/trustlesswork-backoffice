import { describe, expect, it } from "vitest";
import { buildPayrollShareCaption } from "@/features/payroll/utils/payroll-share-image.helper";

const baseReceivers = [
  {
    name: "Armando",
    wallet: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    amount: 1249,
  },
  {
    name: "Alberto",
    wallet: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    amount: 1249,
  },
] as const;

describe("payroll-share-image.helper", () => {
  it("builds a short salary share caption", () => {
    expect(
      buildPayrollShareCaption({
        periodLabel: "2da quincena - September 2026",
        totalAmount: 4996,
        memberCount: 4,
        contractId: "CBZK3TOW6WELA7ECNGDDLPQJ32GDZ56TEVGSG566RV2F5A75HRWBX65D",
        engagementId: "payroll-2026-09-Q2",
        kind: "salary",
        receivers: baseReceivers,
      }),
    ).toBe(
      [
        "Trustless Work payroll paid ✅",
        "2da quincena - September 2026",
        "4,996.00 · 4 members",
      ].join("\n"),
    );
  });

  it("builds a short test share caption", () => {
    expect(
      buildPayrollShareCaption({
        periodLabel: "2da quincena - September 2026",
        totalAmount: 4,
        memberCount: 4,
        contractId: "CBZK3TOW6WELA7ECNGDDLPQJ32GDZ56TEVGSG566RV2F5A75HRWBX65D",
        engagementId: "payroll-2026-09-Q2",
        kind: "test",
        receivers: baseReceivers,
      }),
    ).toBe(
      [
        "Trustless Work test payments paid ✅",
        "2da quincena - September 2026",
        "4.00 · 4 members",
      ].join("\n"),
    );
  });
});
