import type { NetworkType } from "@/types/network.entity";

export type ChallengeNetwork = "PUBLIC" | "TESTNET";

const NETWORK_BY_PASSPHRASE: Readonly<Record<string, NetworkType>> = {
  "Public Global Stellar Network ; September 2015": "mainnet",
  "Test SDF Network ; September 2015": "testnet",
};

export function networkFromPassphrase(
  passphrase: string | undefined,
): NetworkType | undefined {
  return passphrase ? NETWORK_BY_PASSPHRASE[passphrase] : undefined;
}

/** Wallets only sign for their selected network, so the challenge follows it. */
export function resolveChallengeNetwork(
  walletPassphrase: string | undefined,
  appNetwork: NetworkType,
): ChallengeNetwork {
  const network = networkFromPassphrase(walletPassphrase) ?? appNetwork;
  return network === "mainnet" ? "PUBLIC" : "TESTNET";
}
