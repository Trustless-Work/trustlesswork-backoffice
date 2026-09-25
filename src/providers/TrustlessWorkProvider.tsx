"use client";

import type { ReactNode } from "react";
import { TrustlessWorkConfigShell } from "@/providers/TrustlessWorkConfigShell";
import { useActiveOrganization } from "@/providers/OrganizationProvider";

type TrustlessWorkProviderProps = {
  children: ReactNode;
};

export const TrustlessWorkProvider = ({
  children,
}: TrustlessWorkProviderProps) => {
  const { activeOrganizationId } = useActiveOrganization();

  return (
    <TrustlessWorkConfigShell platformId={activeOrganizationId}>
      {children}
    </TrustlessWorkConfigShell>
  );
};
