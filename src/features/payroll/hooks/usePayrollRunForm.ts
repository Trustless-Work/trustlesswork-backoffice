"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDeployEscrow } from "@trustless-work/escrow";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ESCROWS_LIST_QUERY_ROOT } from "@/features/escrows/constants/escrow.constants";
import { useSignAndSend } from "@/features/escrows/hooks/useSignAndSend";
import { getEscrowErrorMessage } from "@/features/escrows/utils/escrow-error.helper";
import {
  refreshEscrowQueries,
  scheduleEscrowIndexerCatchUp,
} from "@/features/escrows/utils/escrow-query.helper";
import { showEscrowTransactionSuccessToast } from "@/features/escrows/utils/escrow-transaction-toast.helper";
import {
  payrollRunSchema,
  type PayrollRunFormData,
} from "@/features/payroll/schemas/payroll-run.schema";
import { getDefaultPayrollFormValues } from "@/features/payroll/utils/payroll-form.helper";
import {
  resolvePayrollDisputeResolver,
  toPayrollDeployPayload,
} from "@/features/payroll/utils/payroll-payload.helper";
import useNetwork from "@/hooks/useNetwork";
import { clientEnv } from "@/lib/env";
import { playSound } from "@/lib/sounds";
import { useWalletContext } from "@/providers/WalletProvider";

type UsePayrollRunFormOptions = {
  onSuccess?: () => void;
};

export function usePayrollRunForm(options?: UsePayrollRunFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletContext();
  const { currentNetwork } = useNetwork();
  const { deployEscrow } = useDeployEscrow();
  const { signAndSend, loading } = useSignAndSend();

  const form = useForm<PayrollRunFormData>({
    resolver: zodResolver(payrollRunSchema),
    defaultValues: getDefaultPayrollFormValues({
      network: currentNetwork,
      signerAddress: walletAddress,
    }),
    mode: "onChange",
  });

  useEffect(() => {
    const defaults = getDefaultPayrollFormValues({
      network: currentNetwork,
      signerAddress: walletAddress,
    });
    form.setValue("members", defaults.members, { shouldValidate: true });
  }, [currentNetwork, form, walletAddress]);

  const onSubmit = async (values: PayrollRunFormData) => {
    if (!walletAddress) {
      toast.error("Connect your wallet to create a payroll run.");
      return;
    }

    const platformId = clientEnv.payroll.platformId;
    if (!platformId) {
      toast.error(
        "Payroll platform ID is not configured (NEXT_PUBLIC_PAYROLL_PLATFORM_ID).",
      );
      return;
    }

    const disputeResolver = resolvePayrollDisputeResolver(currentNetwork);
    if (!disputeResolver) {
      toast.error(
        "Payroll dispute resolver is not configured (NEXT_PUBLIC_PAYROLL_DISPUTE_RESOLVER).",
      );
      return;
    }

    if (
      currentNetwork === "testnet" &&
      values.members.some(
        (member) => member.include && member.address !== walletAddress,
      )
    ) {
      toast.error(
        "On testnet, reconnect your wallet so member receivers match the template pattern.",
      );
      return;
    }

    const payload = toPayrollDeployPayload(
      values,
      walletAddress,
      disputeResolver,
      currentNetwork,
    );

    try {
      const response = await signAndSend(() =>
        deployEscrow(payload, "multi-release", { platformId }),
      );

      const contractId = response.contractId;

      if (!contractId) {
        toast.error("Payroll run deployed but contract id was not returned.");
        return;
      }

      await refreshEscrowQueries(queryClient, contractId);
      await queryClient.invalidateQueries({
        queryKey: ESCROWS_LIST_QUERY_ROOT,
      });
      scheduleEscrowIndexerCatchUp(queryClient, contractId);

      showEscrowTransactionSuccessToast({
        title: "Payroll run created",
        txHash: response.txHash,
      });
      playSound("deploy");
      options?.onSuccess?.();
      router.push(`/admin/payroll/${contractId}`);
    } catch (error) {
      playSound("error");
      toast.error(getEscrowErrorMessage(error));
    }
  };

  return {
    form,
    onSubmit,
    loading,
    walletAddress,
  };
}
