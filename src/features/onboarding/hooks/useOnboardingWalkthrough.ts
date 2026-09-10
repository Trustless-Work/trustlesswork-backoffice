"use client";

import { useCallback, useState } from "react";
import { ONBOARDING_STEPS } from "@/features/onboarding/constants/onboarding-steps.constants";
import {
  clearOnboardingPending,
  isOnboardingCompleted,
  isOnboardingPending,
  markOnboardingCompleted,
} from "@/features/onboarding/lib/onboarding-storage";

export type OnboardingWalkthroughState = {
  readonly open: boolean;
  readonly stepIndex: number;
  readonly totalSteps: number;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly skip: () => void;
  readonly finish: () => void;
  readonly openWalkthrough: () => void;
  readonly tryAutoOpen: () => void;
};

export function useOnboardingWalkthrough(
  userId: string | undefined,
): OnboardingWalkthroughState {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const completeWalkthrough = useCallback(() => {
    if (userId) {
      markOnboardingCompleted(userId);
    }

    clearOnboardingPending();
    setOpen(false);
    setStepIndex(0);
  }, [userId]);

  const openWalkthrough = useCallback(() => {
    setStepIndex(0);
    setOpen(true);
  }, []);

  const tryAutoOpen = useCallback(() => {
    if (!userId || isOnboardingCompleted(userId) || !isOnboardingPending()) {
      return;
    }

    clearOnboardingPending();
    openWalkthrough();
  }, [openWalkthrough, userId]);

  const next = useCallback(() => {
    if (isLastStep) {
      completeWalkthrough();
      return;
    }

    setStepIndex((current) => current + 1);
  }, [completeWalkthrough, isLastStep]);

  const previous = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const skip = completeWalkthrough;
  const finish = completeWalkthrough;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        completeWalkthrough();
        return;
      }

      setOpen(true);
    },
    [completeWalkthrough],
  );

  return {
    open,
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    setOpen: handleOpenChange,
    next,
    previous,
    skip,
    finish,
    openWalkthrough,
    tryAutoOpen,
  };
}
