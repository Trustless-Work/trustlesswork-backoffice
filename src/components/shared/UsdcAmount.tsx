import Image from "next/image";
import type { ReactNode } from "react";
import {
  formatAssetAmount,
  isUsdcSymbol,
  isUsdtSymbol,
} from "@/helpers/format.helper";
import { cn } from "@/lib/utils";

export type UsdcAmountSize = "sm" | "md" | "lg" | "xl" | "2xl";

type UsdcAmountProps = {
  amount: number;
  symbol: string;
  className?: string;
  iconClassName?: string;
  size?: UsdcAmountSize;
  emphasis?: boolean;
};

const iconSizes: Record<UsdcAmountSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
};

function getAmountTextSizeClass(size: UsdcAmountSize): string {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
    case "2xl":
      return "text-2xl";
  }
}

export const UsdcAmount = ({
  amount,
  symbol,
  className,
  iconClassName,
  size = "md",
  emphasis = false,
}: UsdcAmountProps) => {
  const isUsdc = isUsdcSymbol(symbol);
  const isUsdt = isUsdtSymbol(symbol);
  const hasBrandedIcon = isUsdc || isUsdt;
  const iconSize = iconSizes[size];
  const formattedAmount = formatAssetAmount(amount);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 tabular-nums",
        className,
      )}
    >
      {isUsdc ? (
        <Image
          src="/usdc.webp"
          alt="USDC"
          width={iconSize}
          height={iconSize}
          className={cn("shrink-0 rounded-full", iconClassName)}
        />
      ) : null}
      {isUsdt ? (
        <Image
          src="/usdt.svg"
          alt="USDT"
          width={iconSize}
          height={iconSize}
          unoptimized
          className={cn("shrink-0 rounded-full", iconClassName)}
        />
      ) : null}
      <span
        className={cn(
          "truncate font-medium",
          getAmountTextSizeClass(size),
          emphasis && "font-semibold",
        )}
      >
        {hasBrandedIcon ? formattedAmount : `${formattedAmount} ${symbol}`}
      </span>
    </span>
  );
};

type UsdcAmountStatProps = {
  label: string;
  amount: number;
  symbol: string;
  emphasis?: boolean;
  size?: UsdcAmountSize;
};

export const UsdcAmountStat = ({
  label,
  amount,
  symbol,
  emphasis = false,
  size,
}: UsdcAmountStatProps) => {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <UsdcAmount
          amount={amount}
          symbol={symbol}
          size={size ?? (emphasis ? "lg" : "md")}
          emphasis={emphasis}
        />
      </dd>
    </div>
  );
};

type OverviewStatProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export const OverviewStat = ({ label, value, mono }: OverviewStatProps) => {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 truncate text-base font-medium",
          mono && "font-mono text-sm",
        )}
      >
        {value}
      </dd>
    </div>
  );
};
