"use client";

import type { ReactNode } from "react";
import { clientEnv } from "@/lib/env";
import { TrustlessWorkConfigShell } from "@/providers/TrustlessWorkConfigShell";

type AdminTrustlessWorkProviderProps = {
  children: ReactNode;
};

/** Admin payroll uses Supabase MFA, not SEP-10 — proxy via admin BFF + PAYROLL_API_KEY. */
const ADMIN_PAYROLL_CORE_BFF_BASE_URL = "/api/admin/payroll/core";

export const AdminTrustlessWorkProvider = ({
  children,
}: AdminTrustlessWorkProviderProps) => {
  return (
    <TrustlessWorkConfigShell
      baseURL={ADMIN_PAYROLL_CORE_BFF_BASE_URL}
      platformId={clientEnv.payroll.platformId}
    >
      {children}
    </TrustlessWorkConfigShell>
  );
};
