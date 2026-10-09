import type { NetworkType } from "@/types/network.entity";

export type CoreUrlConfig = {
  readonly testnetUrl: string;
  readonly mainnetUrl: string | undefined;
};

export type AdminApiKeyConfig = {
  readonly testnetAdminApiKey: string | undefined;
  readonly mainnetAdminApiKey: string | undefined;
};

function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveCoreApiUrl(
  network: NetworkType,
  config: CoreUrlConfig,
): string | undefined {
  if (network === "mainnet") {
    const url = trimToUndefined(config.mainnetUrl);
    return url?.replace(/\/$/, "");
  }

  return config.testnetUrl.replace(/\/$/, "");
}

export function resolveAdminApiKey(
  network: NetworkType,
  config: AdminApiKeyConfig,
): string | undefined {
  const key =
    network === "mainnet"
      ? config.mainnetAdminApiKey
      : config.testnetAdminApiKey;
  return trimToUndefined(key);
}

export type PayrollApiKeyConfig = {
  readonly testnetPayrollApiKey: string | undefined;
  readonly mainnetPayrollApiKey: string | undefined;
};

export function resolvePayrollApiKey(
  network: NetworkType,
  config: PayrollApiKeyConfig,
): string | undefined {
  const key =
    network === "mainnet"
      ? config.mainnetPayrollApiKey
      : config.testnetPayrollApiKey;
  return trimToUndefined(key);
}
