import { describe, expect, it } from "vitest";
import {
  formatPeriodKey,
  growthHintLabel,
} from "@/helpers/period-key.helper";

describe("formatPeriodKey", () => {
  it("formats month keys", () => {
    expect(formatPeriodKey("2026-08", "month", "full")).toBe("Aug 2026");
  });

  it("formats day keys", () => {
    expect(formatPeriodKey("2026-08-26", "day", "short")).toBe("Aug 26");
  });

  it("formats week keys with a week-of label in full style", () => {
    expect(formatPeriodKey("2026-08-25", "week", "full")).toBe(
      "Week of Aug 25, 2026",
    );
  });
});

describe("growthHintLabel", () => {
  it("returns bucket-over-bucket labels", () => {
    expect(growthHintLabel("day")).toBe("day over day");
    expect(growthHintLabel("week")).toBe("week over week");
    expect(growthHintLabel("month")).toBe("month over month");
  });
});
