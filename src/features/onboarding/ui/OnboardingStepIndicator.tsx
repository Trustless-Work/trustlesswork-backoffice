"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/features/onboarding/constants/onboarding-steps.constants";

type OnboardingStepIndicatorProps = {
  currentStep: number;
};

export const OnboardingStepIndicator = ({
  currentStep,
}: OnboardingStepIndicatorProps) => {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center">
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === ONBOARDING_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className={cn("flex min-w-0 items-center", !isLast && "flex-1")}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    "border-primary bg-primary/10 text-primary shadow-[0_0_0_3px] shadow-primary/15",
                  !isCompleted &&
                    !isActive &&
                    "border-border bg-background text-muted-foreground",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <CheckIcon className="size-3.5" aria-hidden />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {!isLast ? (
                <div
                  aria-hidden
                  className={cn(
                    "mx-1.5 h-px flex-1 rounded-full transition-colors",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
