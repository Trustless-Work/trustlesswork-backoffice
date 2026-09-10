"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ONBOARDING_STEPS } from "@/features/onboarding/constants/onboarding-steps.constants";
import type { OnboardingWalkthroughState } from "@/features/onboarding/hooks/useOnboardingWalkthrough";
import { OnboardingStepIndicator } from "@/features/onboarding/ui/OnboardingStepIndicator";
import { OnboardingStepPanels } from "@/features/onboarding/ui/OnboardingStepPanels";

type OnboardingWalkthroughDialogProps = {
  walkthrough: OnboardingWalkthroughState;
};

export const OnboardingWalkthroughDialog = ({
  walkthrough,
}: OnboardingWalkthroughDialogProps) => {
  const {
    open,
    setOpen,
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    next,
    previous,
    skip,
  } = walkthrough;

  const currentStep = ONBOARDING_STEPS[stepIndex];

  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="gap-4 border-b border-border px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-center gap-3 pr-8">
            <Image
              src="/icon.png"
              alt="Trustless Work"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-lg"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">
                Trustless Work
              </p>
              <p className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {totalSteps}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
              {currentStep.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {currentStep.description}
            </DialogDescription>
          </div>

          <OnboardingStepIndicator currentStep={stepIndex} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <OnboardingStepPanels stepIndex={stepIndex} />
        </div>

        <DialogFooter className="m-0 flex-row items-center justify-between gap-2 rounded-b-xl border-t border-border px-5 py-4 sm:justify-between sm:px-6">
          <Button type="button" variant="ghost" size="sm" onClick={skip}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={previous}
              disabled={isFirstStep}
            >
              Previous
            </Button>
            <Button type="button" size="sm" onClick={next}>
              {isLastStep ? "Get started" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
