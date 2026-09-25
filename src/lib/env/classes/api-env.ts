import type { ServerEnvConfig } from "@/lib/env/server-env-schema";

export class ApiEnv {
  constructor(private readonly config: ServerEnvConfig) {}

  get coreApiUrl(): string {
    return this.config.CORE_API_URL.replace(/\/$/, "");
  }

  get adminApiKey(): string | undefined {
    return this.config.BACKOFFICE_ADMIN_API_KEY;
  }

  get payrollApiKey(): string | undefined {
    return this.config.PAYROLL_API_KEY;
  }
}
