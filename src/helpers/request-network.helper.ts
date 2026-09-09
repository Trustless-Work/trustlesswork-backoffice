import type { NextRequest } from "next/server";
import type { NetworkType } from "@/types/network.entity";
import { isValidStellarNetwork } from "@/helpers/validators.helper";

export function parseRequestNetwork(request: NextRequest): NetworkType {
  const raw = request.headers.get("x-network")?.trim().toLowerCase();
  if (raw && isValidStellarNetwork(raw)) {
    return raw;
  }
  return "testnet";
}
