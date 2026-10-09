"use client";

import { TrustlessWorkConfig } from "@trustless-work/escrow";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import useNetwork from "@/hooks/useNetwork";

type TrustlessWorkConfigShellProps = {
  platformId?: string | null;
  /** Same-origin BFF base. Defaults to dashboard `/api/core` (SEP-10 session). */
  baseURL?: string;
  children: ReactNode;
};

type TrustlessWorkChildren = ComponentProps<
  typeof TrustlessWorkConfig
>["children"];

const DEFAULT_CORE_BFF_BASE_URL = "/api/core";

export const TrustlessWorkConfigShell = ({
  platformId,
  baseURL = DEFAULT_CORE_BFF_BASE_URL,
  children,
}: TrustlessWorkConfigShellProps) => {
  const { currentNetwork } = useNetwork();
  const defaultHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "x-network": currentNetwork,
    };

    if (platformId) {
      headers["X-TW-Platform"] = platformId;
    }

    return headers;
  }, [currentNetwork, platformId]);

  return (
    <TrustlessWorkConfig baseURL={baseURL} defaultHeaders={defaultHeaders}>
      {children as TrustlessWorkChildren}
    </TrustlessWorkConfig>
  );
};
