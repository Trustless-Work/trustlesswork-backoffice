import { describe, expect, it } from "vitest";
import {
  funnelLiveTotal,
  normalizeStatusFunnel,
} from "@/features/admin-analytics/utils/status-funnel.util";

describe("normalizeStatusFunnel", () => {
  it("fills missing statuses with zero", () => {
    const rows = normalizeStatusFunnel([{ status: "active", count: 20 }]);
    expect(rows.find((row) => row.key === "released")?.count).toBe(0);
    expect(rows.find((row) => row.key === "disputed")?.count).toBe(0);
  });

  it("maps unknown and null statuses to other", () => {
    const rows = normalizeStatusFunnel([
      { status: null, count: 2 },
      { status: "pending", count: 3 },
    ]);
    expect(rows.find((row) => row.key === "other")?.count).toBe(5);
  });
});

describe("funnelLiveTotal", () => {
  it("sums all funnel rows", () => {
    const rows = normalizeStatusFunnel([
      { status: "active", count: 10 },
      { status: "released", count: 5 },
    ]);
    expect(funnelLiveTotal(rows)).toBe(15);
  });
});
