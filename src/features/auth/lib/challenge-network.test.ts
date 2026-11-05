import { describe, expect, it } from "vitest";
import { resolveChallengeNetwork } from "@/features/auth/lib/challenge-network";

const PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

describe("resolveChallengeNetwork", () => {
  it("follows the wallet even when the app is on the other network", () => {
    expect(resolveChallengeNetwork(TESTNET_PASSPHRASE, "mainnet")).toBe(
      "TESTNET",
    );
    expect(resolveChallengeNetwork(PUBLIC_PASSPHRASE, "testnet")).toBe(
      "PUBLIC",
    );
  });

  it("falls back to the app's network when the wallet can't report one", () => {
    expect(resolveChallengeNetwork(undefined, "testnet")).toBe("TESTNET");
    expect(resolveChallengeNetwork(undefined, "mainnet")).toBe("PUBLIC");
  });

  it("falls back to the app's network on an unknown passphrase", () => {
    expect(resolveChallengeNetwork("Some Other Network", "testnet")).toBe(
      "TESTNET",
    );
  });
});
