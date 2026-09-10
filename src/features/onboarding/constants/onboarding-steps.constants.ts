import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  Building2Icon,
  CircleHelpIcon,
  FlaskConicalIcon,
  GlobeIcon,
  KeyRoundIcon,
  LayersIcon,
  MessageCircleIcon,
  PackageIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import {
  ESCROW_ROLE_HELP_PATH,
  TRUSTLESS_WORK_DOCS_URL,
} from "@/constants/escrow-roles.constants";

export const ONBOARDING_STEP_IDS = [
  "welcome",
  "organizations",
  "escrow-types",
  "roles",
  "api-keys",
  "resources",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export type OnboardingStep = {
  readonly id: OnboardingStepId;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Trustless Work",
    description:
      "Escrow-as-a-Service on Stellar — operate payments, orgs, and integrations from this backoffice.",
    icon: SparklesIcon,
  },
  {
    id: "organizations",
    title: "Organizations",
    description:
      "Your workspace for escrows, API keys, and members under one tenant.",
    icon: Building2Icon,
  },
  {
    id: "escrow-types",
    title: "Escrow types",
    description:
      "Chosen at deploy and fixed afterward. Pick the payout model that fits the job.",
    icon: LayersIcon,
  },
  {
    id: "roles",
    title: "Escrow roles",
    description:
      "Each wallet has a clear job. No single actor controls the full fund flow.",
    icon: UsersIcon,
  },
  {
    id: "api-keys",
    title: "API keys",
    description:
      "Machine credentials scoped to one organization for server-side integration.",
    icon: KeyRoundIcon,
  },
  {
    id: "resources",
    title: "Resources",
    description: "Docs, demos, and community links to keep building.",
    icon: BookOpenIcon,
  },
];

export type OnboardingRoleSummary = {
  readonly label: string;
  readonly description: string;
};

export const ONBOARDING_ROLE_SUMMARIES: readonly OnboardingRoleSummary[] = [
  {
    label: "Approvers",
    description: "Validate completed milestones before funds move forward.",
  },
  {
    label: "Service Providers",
    description: "Deliver work and update milestone status on-chain.",
  },
  {
    label: "Release Signers",
    description: "Execute payouts once conditions are met.",
  },
  {
    label: "Dispute Resolvers",
    description: "Arbitrate contested escrows and reroute funds.",
  },
  {
    label: "Receiver",
    description: "Receive released funds when milestones are approved.",
  },
  {
    label: "Platform",
    description: "Tenant address tied to your organization integration.",
  },
];

export type OnboardingEscrowTypeSummary = {
  readonly title: string;
  readonly description: string;
};

export const ONBOARDING_ESCROW_TYPES: readonly OnboardingEscrowTypeSummary[] = [
  {
    title: "Single-release",
    description:
      "Multiple milestones, one payout when all are approved. Best for simple jobs or deposits.",
  },
  {
    title: "Multi-release",
    description:
      "Each milestone pays out independently. Best for grants and milestone billing.",
  },
];

export const ONBOARDING_API_KEY_STEPS: readonly string[] = [
  "Connect your Stellar wallet and sign in.",
  "Select or create an organization.",
  "Open API Keys and generate a new key.",
  "Copy the secret once — it is shown only at creation.",
  "Use it server-side as the x-api-key header.",
];

export const ONBOARDING_ORG_POINTS: readonly string[] = [
  "Create an organization for each team or client.",
  "Invite members with defined access.",
  "Scope API keys and escrows to the active org.",
];

export const API_KEYS_PATH = "/dashboard/api-keys";

export type OnboardingResourceLink = {
  readonly title: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly external: boolean;
};

export const ONBOARDING_RESOURCE_LINKS: readonly OnboardingResourceLink[] = [
  {
    title: "Documentation",
    href: TRUSTLESS_WORK_DOCS_URL,
    icon: BookOpenIcon,
    external: true,
  },
  {
    title: "Laboratory",
    href: "https://demo.trustlesswork.com",
    icon: FlaskConicalIcon,
    external: true,
  },
  {
    title: "Website",
    href: "https://trustlesswork.com",
    icon: GlobeIcon,
    external: true,
  },
  {
    title: "Blocks",
    href: "https://blocks.trustlesswork.com",
    icon: PackageIcon,
    external: true,
  },
  {
    title: "Help center",
    href: ESCROW_ROLE_HELP_PATH,
    icon: CircleHelpIcon,
    external: false,
  },
  {
    title: "Discord",
    href: "https://discord.gg/BAU5s2kVp2",
    icon: MessageCircleIcon,
    external: true,
  },
];
