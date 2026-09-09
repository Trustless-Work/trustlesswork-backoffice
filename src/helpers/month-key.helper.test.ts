import { describe, expect, it } from "vitest";
import {
  buildMonthRange,
  formatMonthKey,
} from "@/helpers/month-key.helper";

describe("formatMonthKey", () => {
  it("formats a UTC month key without Date parsing", () => {
    expect(formatMonthKey("2026-08")).toBe("Aug");
    expect(formatMonthKey("2026-08", "full")).toBe("Aug 2026");
  });

  it("returns the original value for invalid keys", () => {
    expect(formatMonthKey("invalid")).toBe("invalid");
  });
});

describe("buildMonthRange", () => {
  it("builds a continuous range ending at the latest month", () => {
    expect(buildMonthRange(["2026-07", "2026-08"], 3)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("returns an empty array when no month keys are provided", () => {
    expect(buildMonthRange([], 12)).toEqual([]);
  });
});
