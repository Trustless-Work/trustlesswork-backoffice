"use client";

import { TrustlessWorkConfig } from "@trustless-work/escrow";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";

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
  const defaultHeaders = useMemo(() => {
    if (!platformId) {
      return undefined;
    }

    return { "X-TW-Platform": platformId };
  }, [platformId]);

  return (
    <TrustlessWorkConfig baseURL={baseURL} defaultHeaders={defaultHeaders}>
      {children as TrustlessWorkChildren}
    </TrustlessWorkConfig>
  );
};
