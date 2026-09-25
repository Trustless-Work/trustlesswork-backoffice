"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { DashboardPageHeaderActions } from "@/components/shared/DashboardPageHeaderContext";
import { Button } from "@/components/ui/button";
import { usePayrollRuns } from "@/features/payroll/hooks/usePayrollRuns";
import { NewPayrollRunDialog } from "@/features/payroll/ui/NewPayrollRunDialog";
import { PayrollRunsList } from "@/features/payroll/ui/PayrollRunsList";

export const PayrollView = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const { runs, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePayrollRuns();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DashboardPageHeaderActions>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          New payroll run
        </Button>
      </DashboardPageHeaderActions>

      <Container className="flex min-h-0 flex-1 flex-col gap-4">
        <PayrollRunsList
          runs={runs}
          isLoading={isLoading}
          onCreateRequest={() => setCreateOpen(true)}
        />

        {hasNextPage ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        ) : null}
      </Container>

      <NewPayrollRunDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
