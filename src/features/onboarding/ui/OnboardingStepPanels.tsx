"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  Building2Icon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  API_KEYS_PATH,
  ONBOARDING_API_KEY_STEPS,
  ONBOARDING_ESCROW_TYPES,
  ONBOARDING_ORG_POINTS,
  ONBOARDING_RESOURCE_LINKS,
  ONBOARDING_ROLE_SUMMARIES,
  ONBOARDING_STEPS,
} from "@/features/onboarding/constants/onboarding-steps.constants";
import { ESCROW_ROLE_HELP_PATH } from "@/constants/escrow-roles.constants";
import type { OnboardingStepId } from "@/features/onboarding/constants/onboarding-steps.constants";
import { cn } from "@/lib/utils";

type OnboardingStepPanelsProps = {
  stepIndex: number;
};

const FeatureIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div
    aria-hidden
    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50"
  >
    <Icon className="size-4 text-foreground" />
  </div>
);

const InsetTile = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl border border-border bg-muted/30 p-4 sm:p-5",
      className,
    )}
  >
    {children}
  </div>
);

const BulletList = ({ items }: { items: readonly string[] }) => (
  <ul className="flex flex-col gap-2.5">
    {items.map((item) => (
      <li
        key={item}
        className="flex gap-2.5 text-sm leading-relaxed text-foreground"
      >
        <span
          aria-hidden
          className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const WelcomeStep = () => (
  <div className="flex flex-col gap-5">
    <div className="flex items-start gap-3">
      <FeatureIcon icon={SparklesIcon} />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trustless Work is Escrow-as-a-Service on Stellar and Soroban. Funds
          stay non-custodial while milestones, approvals, and disputes run
          on-chain.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This backoffice is where you operate escrows, manage organizations,
          and connect integrations — all from your wallet.
        </p>
      </div>
    </div>
  </div>
);

const OrganizationsStep = () => (
  <div className="flex flex-col gap-5">
    <div className="flex items-start gap-3">
      <FeatureIcon icon={Building2Icon} />
      <p className="pt-0.5 text-sm leading-relaxed text-muted-foreground">
        Switch the active organization from the sidebar. One org can hold many
        escrows across different wallets and contexts.
      </p>
    </div>
    <InsetTile>
      <BulletList items={ONBOARDING_ORG_POINTS} />
    </InsetTile>
  </div>
);

const EscrowTypesStep = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {ONBOARDING_ESCROW_TYPES.map((type) => (
      <InsetTile key={type.title} className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-tight">{type.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {type.description}
        </p>
      </InsetTile>
    ))}
  </div>
);

const RolesStep = () => (
  <div className="flex flex-col gap-5">
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {ONBOARDING_ROLE_SUMMARIES.map((role) => (
        <li key={role.label}>
          <InsetTile className="h-full p-3.5 sm:p-4">
            <p className="text-sm font-semibold tracking-tight">{role.label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {role.description}
            </p>
          </InsetTile>
        </li>
      ))}
    </ul>
    <Button variant="outline" size="sm" className="w-fit" asChild>
      <Link href={ESCROW_ROLE_HELP_PATH}>
        Read full role guide
        <ArrowUpRightIcon className="size-3.5" />
      </Link>
    </Button>
  </div>
);

const ApiKeysStep = () => (
  <div className="flex flex-col gap-5">
    <InsetTile>
      <ol className="flex flex-col gap-3">
        {ONBOARDING_API_KEY_STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold tabular-nums text-foreground">
              {index + 1}
            </span>
            <span className="pt-0.5 text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </InsetTile>
    <Button variant="outline" size="sm" className="w-fit" asChild>
      <Link href={API_KEYS_PATH}>
        Go to API Keys
        <ArrowUpRightIcon className="size-3.5" />
      </Link>
    </Button>
  </div>
);

const ResourcesStep = () => (
  <ul className="grid gap-2.5 sm:grid-cols-2">
    {ONBOARDING_RESOURCE_LINKS.map((resource) => {
      const Icon = resource.icon;

      return (
        <li key={resource.title}>
          <Link
            href={resource.href}
            target={resource.external ? "_blank" : undefined}
            rel={resource.external ? "noopener noreferrer" : undefined}
            className={cn(
              "flex h-full items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3.5 py-3",
              "transition-colors hover:bg-muted/50",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            <FeatureIcon icon={Icon} />
            <span className="min-w-0 flex-1 text-sm font-medium tracking-tight">
              {resource.title}
            </span>
            {resource.external ? (
              <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
          </Link>
        </li>
      );
    })}
  </ul>
);

const STEP_PANELS: Record<OnboardingStepId, () => ReactNode> = {
  welcome: WelcomeStep,
  organizations: OrganizationsStep,
  "escrow-types": EscrowTypesStep,
  roles: RolesStep,
  "api-keys": ApiKeysStep,
  resources: ResourcesStep,
};

export const OnboardingStepPanels = ({
  stepIndex,
}: OnboardingStepPanelsProps) => {
  const step = ONBOARDING_STEPS[stepIndex];

  if (!step) {
    return null;
  }

  const Panel = STEP_PANELS[step.id];

  return <Panel />;
};
