import { cn } from "@/lib/utils";
import { MessageCircle, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/helpers/chart-format.helper";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type BudgetSentenceInsightProps = {
  className?: string;
  pendingReleasePct: number;
};

export function BudgetSentenceInsight({
  className,
  pendingReleasePct,
}: BudgetSentenceInsightProps) {
  const rounded = Math.abs(pendingReleasePct);
  const tone =
    pendingReleasePct <= 0
      ? "No funds are pending release across recent escrows."
      : null;

  return (
    <DashboardCard
      className={cn("h-full min-h-0 min-w-0 flex-1 gap-6 ps-6", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-medium text-sm">
          <PieChart className="size-4" strokeWidth={2} />
          Insights
        </div>
        <div className="flex items-center gap-2">
          <Button className="text-muted-foreground" size="sm" variant="ghost">
            <MessageCircle
              aria-hidden="true"
              data-icon="inline-start"
              strokeWidth={2}
            />
            Escrow Insights
          </Button>
        </div>
      </div>

      <p
        className={cn(
          "text-pretty text-left text-base text-muted-foreground tracking-wide",
          "md:max-w-86 md:text-lg xl:text-2xl",
        )}
      >
        {tone ?? (
          <>
            Pending release is{" "}
            <span className="font-medium text-foreground">
              {formatPercent(rounded, 1)} of deposited volume
            </span>{" "}
            across recent org escrows.
          </>
        )}
      </p>
    </DashboardCard>
  );
}
