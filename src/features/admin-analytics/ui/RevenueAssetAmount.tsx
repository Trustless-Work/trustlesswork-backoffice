"use client";

import type { UsdcAmountSize } from "@/components/shared/UsdcAmount";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { XlmAmount } from "@/components/shared/XlmAmount";
import { cn } from "@/lib/utils";
import type { RevenueAsset } from "@/features/admin-analytics/types/analytics.types";
import {
  isUsdcRevenueAsset,
  isUsdtRevenueAsset,
  isXlmRevenueAsset,
  resolveAssetSymbol,
} from "@/features/admin-analytics/utils/revenue.util";

type RevenueAssetAmountProps = {
  asset: RevenueAsset;
  amount: string;
  size?: UsdcAmountSize;
  emphasis?: boolean;
  className?: string;
  align?: "left" | "right";
};

export function isUsdcAsset(asset: RevenueAsset): boolean {
  return isUsdcRevenueAsset(asset);
}

export function isUsdtAsset(asset: RevenueAsset): boolean {
  return isUsdtRevenueAsset(asset);
}

export function isXlmAsset(asset: RevenueAsset): boolean {
  return isXlmRevenueAsset(asset);
}

function parseDisplayAmount(amount: string): number {
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed : 0;
}

function BrandedAmount({
  asset,
  amount,
  size,
  emphasis,
  align,
  className,
}: RevenueAssetAmountProps) {
  const symbol = resolveAssetSymbol(asset);
  const numericAmount = parseDisplayAmount(amount);
  const unresolvedMarker = asset.resolved ? null : "*";

  const brandedAmount =
    isUsdcAsset(asset) || isUsdtAsset(asset) ? (
      <UsdcAmount
        amount={numericAmount}
        emphasis={emphasis}
        size={size}
        symbol={symbol}
      />
    ) : (
      <XlmAmount
        amount={numericAmount}
        emphasis={emphasis}
        size={size}
        symbol={symbol}
      />
    );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        align === "right" && "justify-end",
        className,
      )}
    >
      {brandedAmount}
      {unresolvedMarker ? (
        <span className="text-muted-foreground text-xs">{unresolvedMarker}</span>
      ) : null}
    </span>
  );
}

export const RevenueAssetAmount = ({
  asset,
  amount,
  size = "sm",
  emphasis = false,
  className,
  align = "left",
}: RevenueAssetAmountProps) => {
  const symbol = resolveAssetSymbol(asset);
  const unresolvedMarker = asset.resolved ? null : "*";

  if (isUsdcAsset(asset) || isUsdtAsset(asset) || isXlmAsset(asset)) {
    return (
      <BrandedAmount
        align={align}
        amount={amount}
        asset={asset}
        className={className}
        emphasis={emphasis}
        size={size}
      />
    );
  }

  const label = unresolvedMarker ? `${symbol}${unresolvedMarker}` : symbol;

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "2xl" && "text-2xl",
        emphasis && "font-semibold",
        align === "right" && "block text-right",
        className,
      )}
    >
      {label} {amount}
    </span>
  );
};
