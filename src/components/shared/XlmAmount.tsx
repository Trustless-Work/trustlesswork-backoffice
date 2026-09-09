import Image from "next/image";
import { formatAssetAmount, isXlmSymbol } from "@/helpers/format.helper";
import { cn } from "@/lib/utils";

export type XlmAmountSize = "sm" | "md" | "lg" | "xl" | "2xl";

type XlmAmountProps = {
  amount: number;
  symbol: string;
  className?: string;
  iconClassName?: string;
  size?: XlmAmountSize;
  emphasis?: boolean;
};

const iconSizes: Record<XlmAmountSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
};

const XLM_ICON_WIDTH = 91;
const XLM_ICON_HEIGHT = 81;

function getAmountTextSizeClass(size: XlmAmountSize): string {
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

export const XlmAmount = ({
  amount,
  symbol,
  className,
  iconClassName,
  size = "md",
  emphasis = false,
}: XlmAmountProps) => {
  const isXlm = isXlmSymbol(symbol);
  const iconSize = iconSizes[size];
  const formattedAmount = formatAssetAmount(amount);
  const iconBoxStyle = { width: iconSize, height: iconSize };

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 tabular-nums",
        className,
      )}
    >
      {isXlm ? (
        <>
          <Image
            src="/xlm.png"
            alt="XLM"
            width={XLM_ICON_WIDTH}
            height={XLM_ICON_HEIGHT}
            style={iconBoxStyle}
            className={cn(
              "shrink-0 object-contain dark:hidden",
              iconClassName,
            )}
          />
          <Image
            src="/xlm-light.png"
            alt="XLM"
            width={XLM_ICON_WIDTH}
            height={XLM_ICON_HEIGHT}
            style={iconBoxStyle}
            className={cn(
              "hidden shrink-0 object-contain dark:block",
              iconClassName,
            )}
          />
        </>
      ) : null}
      <span
        className={cn(
          "truncate font-medium",
          getAmountTextSizeClass(size),
          emphasis && "font-semibold",
        )}
      >
        {isXlm ? formattedAmount : `${formattedAmount} ${symbol}`}
      </span>
    </span>
  );
};

type XlmAmountStatProps = {
  label: string;
  amount: number;
  symbol: string;
  emphasis?: boolean;
  size?: XlmAmountSize;
};

export const XlmAmountStat = ({
  label,
  amount,
  symbol,
  emphasis = false,
  size,
}: XlmAmountStatProps) => {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <XlmAmount
          amount={amount}
          symbol={symbol}
          size={size ?? (emphasis ? "lg" : "md")}
          emphasis={emphasis}
        />
      </dd>
    </div>
  );
};
