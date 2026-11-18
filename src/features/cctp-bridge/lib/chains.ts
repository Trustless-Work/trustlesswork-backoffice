import type { Chain } from "viem";
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  avalanche,
  avalancheFuji,
  polygon,
  polygonAmoy,
} from "viem/chains";
import { getStoredNetwork } from "@/lib/client-storage";

/** CCTP destination chain for EVM mints. `domain` is Circle's CCTP domain; `messageTransmitter.receiveMessage` completes the mint. */
export interface CctpDestinationChain {
  domain: number;
  label: string;
  chainId: number;
  viemChain: Chain;
  messageTransmitter: `0x${string}`;
}

/** CCTP v2 MessageTransmitterV2 — same address across every EVM chain in an environment. */
const MESSAGE_TRANSMITTER_V2 = {
  testnet: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  mainnet: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
} as const;

interface ChainDefinition {
  domain: number;
  label: string;
  testnet: Chain;
  mainnet: Chain;
}

/** EVM chains the UI can complete a mint on. Solana is handled separately (auto-completed by Circle, no manual EVM mint path). */
const CHAIN_DEFINITIONS: ChainDefinition[] = [
  { domain: 0, label: "Ethereum", testnet: sepolia, mainnet },
  { domain: 1, label: "Avalanche", testnet: avalancheFuji, mainnet: avalanche },
  { domain: 2, label: "Optimism", testnet: optimismSepolia, mainnet: optimism },
  { domain: 3, label: "Arbitrum", testnet: arbitrumSepolia, mainnet: arbitrum },
  { domain: 6, label: "Base", testnet: baseSepolia, mainnet: base },
  { domain: 7, label: "Polygon", testnet: polygonAmoy, mainnet: polygon },
];

/** Destination chains for the currently selected network (via `getStoredNetwork()`). */
export function getCctpDestinationChains(): CctpDestinationChain[] {
  const isMainnet = getStoredNetwork() === "mainnet";
  const messageTransmitter = isMainnet
    ? MESSAGE_TRANSMITTER_V2.mainnet
    : MESSAGE_TRANSMITTER_V2.testnet;

  return CHAIN_DEFINITIONS.map((c) => {
    const viemChain = isMainnet ? c.mainnet : c.testnet;
    return {
      domain: c.domain,
      label: c.label,
      chainId: viemChain.id,
      viemChain,
      messageTransmitter,
    };
  });
}

export function getCctpChainByDomain(
  domain: number,
): CctpDestinationChain | undefined {
  return getCctpDestinationChains().find((c) => c.domain === domain);
}

/** A destination the receiver can register in the payout-preference selector. */
export interface CctpDestinationOption {
  domain: number;
  label: string;
}

/** Circle's CCTP domain for Solana. Same on testnet and mainnet. */
const SOLANA_DOMAIN = 5;

/** Destinations for the payout-preference selector: EVM chains plus Solana (registration only needs a domain + address). */
export function getCctpDestinationOptions(): CctpDestinationOption[] {
  const evm = getCctpDestinationChains().map(({ domain, label }) => ({
    domain,
    label,
  }));
  return [...evm, { domain: SOLANA_DOMAIN, label: "Solana" }];
}

/** Domain -> label map for read-only display of a registered preference. */
const ALL_DOMAIN_LABELS: Record<number, string> = {
  0: "Ethereum",
  1: "Avalanche",
  2: "Optimism",
  3: "Arbitrum",
  5: "Solana",
  6: "Base",
  7: "Polygon",
};

export function getCctpDomainLabel(domain: number): string {
  return ALL_DOMAIN_LABELS[domain] ?? `Domain ${domain}`;
}
