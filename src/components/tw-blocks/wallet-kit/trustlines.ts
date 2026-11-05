import { getStoredNetwork } from "@/lib/client-storage";
import type { NetworkType } from "@/types/network.entity";

/**
 * Trustlines | Non-Native Tokens from Stellar (Soroban SAC contract ids)
 *
 * Deploy expects `trustline.contractId` (C… 56 chars) + `trustline.symbol`.
 * Preset `address` values are the SAC contract ids used as contractId on deploy.
 */
export const trustlines = [
  // TESTNET — Circle USDC SAC
  {
    symbol: "USDC",
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    network: "testnet",
  },
  // MAINNET — Circle USDC SAC
  {
    symbol: "USDC",
    address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    network: "mainnet",
  },
];

export function getTrustlineOptions(
  network: NetworkType = getStoredNetwork(),
): { value: string; label: string }[] {
  return trustlines
    .filter((trustline) => trustline.network === network)
    .map((trustline) => ({
      value: trustline.address,
      label: trustline.symbol,
    }));
}
