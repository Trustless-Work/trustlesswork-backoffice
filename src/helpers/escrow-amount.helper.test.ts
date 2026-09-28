import { describe, expect, it } from "vitest";
import { readEscrowWireAmount } from "@/helpers/escrow-amount.helper";

describe("readEscrowWireAmount", () => {
  it("reads a decimal string amount and trims it", () => {
    expect(readEscrowWireAmount({ amount: "  250.5  " })).toBe("250.5");
  });

  it("reads a finite number", () => {
    expect(readEscrowWireAmount({ amount: 10 })).toBe(10);
  });

  it("returns null when amount is missing, null, or blank", () => {
    expect(readEscrowWireAmount({})).toBeNull();
    expect(readEscrowWireAmount({ amount: null })).toBeNull();
    expect(readEscrowWireAmount({ amount: "   " })).toBeNull();
    expect(readEscrowWireAmount({ totalAmount: "99" })).toBeNull();
  });
});
