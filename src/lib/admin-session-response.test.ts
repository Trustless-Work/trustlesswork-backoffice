import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANALYTICS_MONTHS,
  parseAnalyticsTopParams,
  parseMonthsParam,
  parseRevenueEventsParams,
} from "@/lib/admin-session-response";

describe("parseMonthsParam", () => {
  it("returns the default when the param is missing", () => {
    const result = parseMonthsParam(null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(DEFAULT_ANALYTICS_MONTHS);
    }
  });

  it("returns the default when the param is blank", () => {
    const result = parseMonthsParam("   ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(DEFAULT_ANALYTICS_MONTHS);
    }
  });

  it("accepts valid integers in range", () => {
    const result = parseMonthsParam("24");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(24);
    }
  });

  it("rejects values below the minimum", () => {
    const result = parseMonthsParam("0");
    expect(result.ok).toBe(false);
  });

  it("rejects values above the maximum", () => {
    const result = parseMonthsParam("37");
    expect(result.ok).toBe(false);
  });

  it("rejects non-numeric values", () => {
    const result = parseMonthsParam("abc");
    expect(result.ok).toBe(false);
  });

  it("rejects fractional values", () => {
    const result = parseMonthsParam("12.5");
    expect(result.ok).toBe(false);
  });
});

describe("parseRevenueEventsParams", () => {
  it("accepts sort, order, search, and asset params", () => {
    const params = new URLSearchParams({
      sort: "amount",
      order: "asc",
      search: "acme",
      asset: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    });
    const result = parseRevenueEventsParams(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sort).toBe("amount");
      expect(result.value.order).toBe("asc");
      expect(result.value.search).toBe("acme");
      expect(result.value.asset).toBe(
        "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      );
    }
  });

  it("rejects invalid sort values", () => {
    const result = parseRevenueEventsParams(
      new URLSearchParams({ sort: "released" }),
    );
    expect(result.ok).toBe(false);
  });
});

describe("parseAnalyticsTopParams", () => {
  it("validates by against an allow list", () => {
    const result = parseAnalyticsTopParams(
      new URLSearchParams({ by: "fee", limit: "20" }),
      ["amount", "fee"],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.by).toBe("fee");
      expect(result.value.limit).toBe(20);
    }
  });
});
