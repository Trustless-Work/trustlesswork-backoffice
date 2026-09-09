import { cn } from "@/lib/utils";
import { formatInteger, formatPercent } from "@/helpers/chart-format.helper";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";

const LINE_COUNT = 64;

type TypeVariant = "single" | "multi";

const TYPE_VARIANTS: Record<
  TypeVariant,
  { label: string; color: string }
> = {
  single: {
    label: "Single-release",
    color: "bg-chart-2",
  },
  multi: {
    label: "Multi-release",
    color: "bg-chart-2/35",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TypeMixTick({
  variant,
  isLead,
}: {
  variant: TypeVariant;
  isLead?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-1 items-end justify-center",
        isLead && "h-[250%]",
      )}
    >
      <div
        className={cn(
          "h-full w-0.5 shrink-0 rounded-full",
          TYPE_VARIANTS[variant].color,
        )}
      />
    </div>
  );
}

type ActiveCustomersProps = {
  total: number;
  singleRelease: number;
  multiRelease: number;
};

export function ActiveCustomers({
  total,
  singleRelease,
  multiRelease,
}: ActiveCustomersProps) {
  const singleShare = total > 0 ? singleRelease / total : 0.5;
  const singlePercent = singleShare * 100;
  const multiPercent = 100 - singlePercent;

  const singleLines =
    total === 0
      ? Math.floor(LINE_COUNT / 2)
      : clamp(Math.round(LINE_COUNT * singleShare), 1, LINE_COUNT - 1);
  const multiLines = LINE_COUNT - singleLines;
  const singleBoundaryPercent = (singleLines / LINE_COUNT) * 100;

  const mixTicks = [
    ...Array.from({ length: singleLines }, (_, index) => ({
      id: `single-${index}`,
      variant: "single" as const,
      isLead: index === 0,
    })),
    ...Array.from({ length: multiLines }, (_, index) => ({
      id: `multi-${index}`,
      variant: "multi" as const,
      isLead: false,
    })),
  ];

  const summary = `${formatInteger(singleRelease)} single-release (${formatPercent(singlePercent, 1)}), ${formatInteger(multiRelease)} multi-release (${formatPercent(multiPercent, 1)})`;

  return (
    <DashboardCard className="gap-0">
      <div className="-mb-2 flex flex-col gap-0.5 ps-3">
        <DashboardCardTitle>Escrow types</DashboardCardTitle>
        <p className="text-balance font-semibold text-2xl text-foreground tabular-nums tracking-tight">
          {formatInteger(total)}
        </p>
      </div>

      <p className="sr-only">
        Escrow types {formatInteger(total)}. {summary}
      </p>

      <div className="relative pt-5">
        {singlePercent > 40 ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2"
            style={{ left: `${singleBoundaryPercent}%` }}
          >
            <div className="flex flex-col items-center">
              <span className="font-medium text-foreground text-xs tabular-nums">
                {formatPercent(singlePercent, 0)}
              </span>
              <div className="h-1 w-px shrink-0 bg-muted-foreground/35" />
            </div>
          </div>
        ) : null}
        <div
          aria-hidden="true"
          className="flex h-7 w-full min-w-0 items-end gap-px"
        >
          {mixTicks.map((tick) => (
            <TypeMixTick
              isLead={tick.isLead}
              key={tick.id}
              variant={tick.variant}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {(Object.keys(TYPE_VARIANTS) as TypeVariant[]).map((variant) => (
          <span
            className="flex cursor-default items-center gap-2 text-muted-foreground underline decoration-muted-foreground/70 decoration-dotted underline-offset-4"
            key={variant}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                TYPE_VARIANTS[variant].color,
              )}
            />
            {TYPE_VARIANTS[variant].label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}
