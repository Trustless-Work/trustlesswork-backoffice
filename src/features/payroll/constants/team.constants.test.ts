import { describe, expect, it } from "vitest";
import {
  getPayrollTeamForNetwork,
  PAYROLL_TEAM,
} from "@/features/payroll/constants/team.constants";

const signer =
  "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX";

describe("getPayrollTeamForNetwork", () => {
  it("returns mainnet roster addresses unchanged", () => {
    expect(getPayrollTeamForNetwork("mainnet", signer)).toEqual(PAYROLL_TEAM);
  });

  it("on testnet replaces every receiver with the connected wallet", () => {
    const team = getPayrollTeamForNetwork("testnet", signer);
    expect(team).toHaveLength(PAYROLL_TEAM.length);
    expect(team.every((member) => member.address === signer)).toBe(true);
    expect(team.map((member) => member.email)).toEqual(
      PAYROLL_TEAM.map((member) => member.email),
    );
  });

  it("on testnet falls back to template admin when no wallet is connected", () => {
    const team = getPayrollTeamForNetwork("testnet", null);
    expect(
      team.every(
        (member) =>
          member.address ===
          "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX",
      ),
    ).toBe(true);
  });
});
