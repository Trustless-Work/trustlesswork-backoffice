import { isValidStellarNetwork } from "@/helpers/validators.helper";
import type { NetworkType } from "@/types/network.entity";

export function resolveClientNetworkHeader(
  explicit: unknown,
  storedNetwork: NetworkType,
): NetworkType {
  if (typeof explicit !== "string") {
    return storedNetwork;
  }

  const value = explicit.trim().toLowerCase();
  if (isValidStellarNetwork(value)) {
    return value;
  }

  return storedNetwork;
}
