import type { NetworkType } from "@/types/network.entity";

export function getApiKeyNetworkLabel(network: NetworkType): string {
  return network === "mainnet" ? "Mainnet" : "Testnet";
}
