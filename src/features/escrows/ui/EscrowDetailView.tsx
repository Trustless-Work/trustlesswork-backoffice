"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { NoData } from "@/components/shared/NoData";
import { EscrowActionsProvider } from "@/features/escrows/providers/EscrowActionsProvider";
import { useEscrowDetail } from "@/features/escrows/hooks/useEscrows";
import { EscrowDetailHeader } from "@/features/escrows/ui/detail/EscrowDetailHeader";
import { EscrowDetailSkeleton } from "@/features/escrows/ui/detail/EscrowDetailSkeleton";
import { EscrowDepositsCard } from "@/features/escrows/ui/detail/EscrowDepositsCard";
import { EscrowDisputePanel } from "@/features/escrows/ui/detail/EscrowDisputePanel";
import { EscrowEventsCard } from "@/features/escrows/ui/detail/EscrowEventsCard";
import { EscrowMilestonesTable } from "@/features/escrows/ui/detail/EscrowMilestonesTable";
import { EscrowOverviewSection } from "@/features/escrows/ui/detail/EscrowOverviewSection";
import { EscrowRolesCard } from "@/features/escrows/ui/detail/EscrowRolesCard";

type EscrowDetailViewProps = {
  contractId: string;
  backHref?: string;
  backLabel?: string;
};

export const EscrowDetailView = ({
  contractId,
  backHref = "/dashboard/escrows",
  backLabel = "Back to escrows",
}: EscrowDetailViewProps) => {
  const router = useRouter();
  const { detail, escrow, isResolving, isError, refetch } =
    useEscrowDetail(contractId);

  if (isResolving) {
    return (
      <Container className="border-none bg-transparent p-0 shadow-none">
        <EscrowDetailSkeleton />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <NoData
          title="Could not load escrow"
          description="Something went wrong while fetching this escrow from the indexer."
          actionLabel="Retry"
          onAction={() => {
            void refetch();
          }}
        />
      </Container>
    );
  }

  if (!escrow || !detail) {
    return (
      <Container>
        <NoData
          title="Escrow not found"
          description="This escrow is not available yet. It may still be indexing after deploy."
          actionLabel={backLabel}
          onAction={() => {
            router.push(backHref);
          }}
        />
      </Container>
    );
  }

  return (
    <EscrowActionsProvider
      contractId={escrow.contractId}
      escrowType={escrow.type}
    >
      <Container className="border-none bg-transparent p-0 shadow-none">
        <div className="flex flex-col gap-6">
          <EscrowDetailHeader
            escrow={escrow}
            backHref={backHref}
            backLabel={backLabel}
          />

          <EscrowOverviewSection escrow={escrow} />
          <EscrowDisputePanel escrow={escrow} />
          <EscrowRolesCard escrow={escrow} />
          <EscrowMilestonesTable escrow={escrow} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EscrowEventsCard events={detail.events} />
            <EscrowDepositsCard deposits={detail.deposits} />
          </div>
        </div>
      </Container>
    </EscrowActionsProvider>
  );
};
