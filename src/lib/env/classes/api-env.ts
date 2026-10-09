import type { ServerEnvConfig } from "@/lib/env/server-env-schema";
import {
  resolveAdminApiKey,
  resolveCoreApiUrl,
  resolvePayrollApiKey,
} from "@/lib/core-target";
import type { NetworkType } from "@/types/network.entity";

export class ApiEnv {
  constructor(private readonly config: ServerEnvConfig) {}

  get coreApiUrl(): string {
    return this.coreApiUrlFor("testnet") ?? this.config.CORE_API_URL.replace(/\/$/, "");
  }

  coreApiUrlFor(network: NetworkType): string | undefined {
    return resolveCoreApiUrl(network, {
      testnetUrl: this.config.CORE_API_URL,
      mainnetUrl: this.config.CORE_API_URL_MAINNET,
    });
  }

  get adminApiKey(): string | undefined {
    return this.adminApiKeyFor("testnet");
  }

  adminApiKeyFor(network: NetworkType): string | undefined {
    return resolveAdminApiKey(network, {
      testnetAdminApiKey: this.config.BACKOFFICE_ADMIN_API_KEY,
      mainnetAdminApiKey: this.config.BACKOFFICE_ADMIN_API_KEY_MAINNET,
    });
  }

  get payrollApiKey(): string | undefined {
    return this.payrollApiKeyFor("testnet");
  }

  payrollApiKeyFor(network: NetworkType): string | undefined {
    return resolvePayrollApiKey(network, {
      testnetPayrollApiKey: this.config.PAYROLL_API_KEY,
      mainnetPayrollApiKey: this.config.PAYROLL_API_KEY_MAINNET,
    });
  }
}
