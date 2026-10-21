export const CONTRACT_VERSION_FILTERS = ["v1", "v2", "all"] as const;

export type ContractVersionFilter = (typeof CONTRACT_VERSION_FILTERS)[number];

export const CONTRACT_GENERATIONS = ["v1", "v2"] as const;

/** On-chain contract generation. `null` means the API could not derive it. */
export type ContractGeneration = (typeof CONTRACT_GENERATIONS)[number];

export function isContractVersionFilter(
  value: string,
): value is ContractVersionFilter {
  return (CONTRACT_VERSION_FILTERS as readonly string[]).includes(value);
}

export function isContractGeneration(
  value: string,
): value is ContractGeneration {
  return (CONTRACT_GENERATIONS as readonly string[]).includes(value);
}
