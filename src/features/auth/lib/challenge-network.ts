import type { NetworkType } from "@/types/network.entity";

export type ChallengeNetwork = "PUBLIC" | "TESTNET";

const CHALLENGE_NETWORK_BY_PASSPHRASE: Readonly<
  Record<string, ChallengeNetwork>
> = {
  "Public Global Stellar Network ; September 2015": "PUBLIC",
  "Test SDF Network ; September 2015": "TESTNET",
};

/** Wallets only sign for their selected network, so the challenge follows it. */
export function resolveChallengeNetwork(
  walletPassphrase: string | undefined,
  appNetwork: NetworkType,
): ChallengeNetwork {
  const fromWallet = walletPassphrase
    ? CHALLENGE_NETWORK_BY_PASSPHRASE[walletPassphrase]
    : undefined;

  return fromWallet ?? (appNetwork === "mainnet" ? "PUBLIC" : "TESTNET");
}
