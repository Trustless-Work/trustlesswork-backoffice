import { describe, expect, it } from "vitest";
import {
  isUsdcSymbol,
  isUsdtSymbol,
  isXlmSymbol,
} from "@/helpers/format.helper";

describe("isUsdcSymbol", () => {
  it("matches USDC regardless of case or surrounding space", () => {
    expect(isUsdcSymbol("USDC")).toBe(true);
    expect(isUsdcSymbol(" usdc ")).toBe(true);
  });

  it("rejects other assets", () => {
    expect(isUsdcSymbol("USDT")).toBe(false);
    expect(isUsdcSymbol("USDT0")).toBe(false);
    expect(isUsdcSymbol("XLM")).toBe(false);
  });
});

describe("isUsdtSymbol", () => {
  it("matches USDT0 and USDT regardless of case or surrounding space", () => {
    expect(isUsdtSymbol("USDT0")).toBe(true);
    expect(isUsdtSymbol(" usdt0 ")).toBe(true);
    expect(isUsdtSymbol("USDT")).toBe(true);
    expect(isUsdtSymbol(" usdt ")).toBe(true);
  });

  it("rejects other assets", () => {
    expect(isUsdtSymbol("USDC")).toBe(false);
    expect(isUsdtSymbol("XLM")).toBe(false);
  });
});

describe("isXlmSymbol", () => {
  it("matches XLM and native", () => {
    expect(isXlmSymbol("XLM")).toBe(true);
    expect(isXlmSymbol("native")).toBe(true);
  });

  it("rejects other assets", () => {
    expect(isXlmSymbol("USDC")).toBe(false);
    expect(isXlmSymbol("USDT")).toBe(false);
    expect(isXlmSymbol("USDT0")).toBe(false);
  });
});
