import type { ClientEnvConfig } from "@/lib/env/client-env-schema";

export class PayrollEnv {
  constructor(private readonly config: ClientEnvConfig) {}

  get platformId(): string | undefined {
    return this.config.NEXT_PUBLIC_PAYROLL_PLATFORM_ID;
  }

  get disputeResolver(): string | undefined {
    return this.config.NEXT_PUBLIC_PAYROLL_DISPUTE_RESOLVER;
  }
}
