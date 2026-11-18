"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payoutPreferenceSchema,
  type PayoutPreferenceFormData,
} from "@/features/cctp-bridge/schemas/payout-preference.schema";
import type { CctpDestinationDomain } from "@/features/cctp-bridge/types/cctp-bridge.types";

type UsePayoutPreferenceFormOptions = {
  onSubmit: (values: {
    destinationDomain: CctpDestinationDomain;
    recipientAddress: string;
  }) => Promise<void>;
  isSubmitting: boolean;
};

export function usePayoutPreferenceForm({
  onSubmit,
  isSubmitting,
}: UsePayoutPreferenceFormOptions) {
  const form = useForm<PayoutPreferenceFormData>({
    resolver: zodResolver(payoutPreferenceSchema),
    defaultValues: {
      destinationDomain: 6,
      recipientAddress: "",
    },
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      destinationDomain: values.destinationDomain as CctpDestinationDomain,
      recipientAddress: values.recipientAddress.trim(),
    });
  });

  return {
    form,
    onSubmit: handleSubmit,
    isSubmitting,
  };
}
