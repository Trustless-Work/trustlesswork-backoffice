"use client";

import { createContext, useContext } from "react";
import type { OnboardingWalkthroughState } from "@/features/onboarding/hooks/useOnboardingWalkthrough";

const OnboardingWalkthroughContext =
  createContext<OnboardingWalkthroughState | null>(null);

export const OnboardingWalkthroughProvider = OnboardingWalkthroughContext.Provider;

export function useOnboardingWalkthroughContext(): OnboardingWalkthroughState {
  const context = useContext(OnboardingWalkthroughContext);

  if (!context) {
    throw new Error(
      "useOnboardingWalkthroughContext must be used within OnboardingWalkthroughProvider",
    );
  }

  return context;
}
