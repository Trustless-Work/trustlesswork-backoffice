"use client";

import { useEffect } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useOnboardingWalkthrough } from "@/features/onboarding/hooks/useOnboardingWalkthrough";
import { OnboardingWalkthroughProvider as OnboardingWalkthroughContextProvider } from "@/features/onboarding/hooks/useOnboardingWalkthroughContext";
import { OnboardingWalkthroughDialog } from "@/features/onboarding/ui/OnboardingWalkthroughDialog";

type OnboardingWalkthroughProviderProps = {
  children: React.ReactNode;
};

export const OnboardingWalkthroughProvider = ({
  children,
}: OnboardingWalkthroughProviderProps) => {
  const { data: user } = useSession();
  const walkthrough = useOnboardingWalkthrough(user?.id);
  const { tryAutoOpen } = walkthrough;

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    tryAutoOpen();
  }, [user?.id, tryAutoOpen]);

  return (
    <OnboardingWalkthroughContextProvider value={walkthrough}>
      <OnboardingWalkthroughDialog walkthrough={walkthrough} />
      {children}
    </OnboardingWalkthroughContextProvider>
  );
};
