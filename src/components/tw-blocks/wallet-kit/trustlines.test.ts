import { afterEach, describe, expect, it, vi } from "vitest";
import { getTrustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import { getDefaultValues } from "@/features/escrows/utils/create-escrow-form.helper";

const TESTNET_USDC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MAINNET_USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

function selectNetwork(network: string) {
  vi.stubGlobal("window", {
    localStorage: { getItem: () => network },
  });
}

describe("getTrustlineOptions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns only the requested network's trustlines", () => {
    expect(getTrustlineOptions("testnet")).toEqual([
      { value: TESTNET_USDC, label: "USDC" },
    ]);
    expect(getTrustlineOptions("mainnet")).toEqual([
      { value: MAINNET_USDC, label: "USDC" },
    ]);
  });

  it("defaults to the selected network", () => {
    selectNetwork("mainnet");
    expect(getTrustlineOptions()[0]?.value).toBe(MAINNET_USDC);
  });

  it("gives a new escrow the selected network's trustline", () => {
    selectNetwork("mainnet");
    expect(getDefaultValues("single-release", "GABC").trustline.address).toBe(
      MAINNET_USDC,
    );

    selectNetwork("testnet");
    expect(getDefaultValues("multi-release", "GABC").trustline.address).toBe(
      TESTNET_USDC,
    );
  });
});
