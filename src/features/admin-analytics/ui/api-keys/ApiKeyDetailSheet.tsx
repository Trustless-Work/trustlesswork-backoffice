"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatIsoDateTimeCompact } from "@/helpers/format.helper";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import {
  formatOrganizationName,
  resolveAssetSymbol,
} from "@/features/admin-analytics/utils/revenue.util";
import {
  formatRequestCount,
  truncateApiKeyId,
} from "@/features/admin-analytics/utils/api-keys.util";
import type { ApiKeyDetailResponse } from "@/features/admin-analytics/types/analytics-v2.types";

type ApiKeyDetailSheetProps = {
  open: boolean;
  isLoading: boolean;
  data: ApiKeyDetailResponse | undefined;
  onOpenChange: (open: boolean) => void;
};

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="shrink-0 pt-0.5 text-muted-foreground text-xs">
      {label}
    </span>
    <div className="min-w-0 text-right text-sm leading-snug">{children}</div>
  </div>
);

const DetailSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    {title ? <p className="font-medium text-sm">{title}</p> : null}
    <div className="divide-y divide-border/60 rounded-lg border border-border/60 px-3">
      {children}
    </div>
  </div>
);

const ApiKeyDetailSheetSkeleton = () => (
  <div className="flex flex-col gap-4 px-4 pb-4">
    <div className="flex gap-2">
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>
    <Skeleton className="h-3 w-48" />
    <div className="divide-y divide-border/60 rounded-lg border border-border/60 px-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 py-2.5"
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
);

export const ApiKeyDetailSheet = ({
  open,
  isLoading,
  data,
  onOpenChange,
}: ApiKeyDetailSheetProps) => {
  const title =
    data?.description?.trim() ||
    (data ? truncateApiKeyId(data.keyId) : "API key");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isLoading ? "API key" : title}</SheetTitle>
          <SheetDescription>
            {isLoading
              ? "Loading key details…"
              : data
                ? formatOrganizationName(data.organization)
                : "Key details"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <ApiKeyDetailSheetSkeleton />
        ) : data ? (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={data.active ? "default" : "secondary"}>
                {data.active ? "Active" : "Inactive"}
              </Badge>
              {data.attribution === "platform" ? (
                <Badge variant="outline">Platform</Badge>
              ) : null}
            </div>

            <DetailSection>
              <DetailRow label="Key ID">
                <span className="break-all font-mono text-xs">{data.keyId}</span>
              </DetailRow>
              <DetailRow label="Roles">
                {data.roles.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    {data.roles.map((role) => (
                      <Badge
                        key={role}
                        className="font-normal"
                        variant="outline"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Created">
                {formatIsoDateTimeCompact(data.createdAt)}
              </DetailRow>
              <DetailRow label="Last used">
                {formatIsoDateTimeCompact(data.lastUsedAt ?? undefined)}
              </DetailRow>
              <DetailRow label="Expires">
                {formatIsoDateTimeCompact(data.expiresAt ?? undefined)}
              </DetailRow>
              {data.lastUsedIp ? (
                <DetailRow label="Last IP">
                  <span className="font-mono text-xs">{data.lastUsedIp}</span>
                </DetailRow>
              ) : null}
            </DetailSection>

            {data.escrowStats.length > 0 ? (
              <DetailSection title="Escrow stats">
                {data.escrowStats.map((stat) => (
                  <DetailRow
                    key={stat.asset.address}
                    label={resolveAssetSymbol(stat.asset)}
                  >
                    <div className="flex flex-col items-end gap-0.5">
                      <RevenueAssetAmount
                        align="right"
                        amount={stat.feeAmount}
                        asset={stat.asset}
                      />
                      <span className="text-muted-foreground text-xs">
                        {stat.escrowCount} escrows
                      </span>
                    </div>
                  </DetailRow>
                ))}
              </DetailSection>
            ) : null}

            {data.usage.length > 0 ? (
              <DetailSection title="Daily requests">
                {data.usage.map((day) => (
                  <DetailRow key={day.day} label={day.day}>
                    <span className="tabular-nums">
                      {formatRequestCount(day.requestCount)}
                    </span>
                  </DetailRow>
                ))}
              </DetailSection>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
