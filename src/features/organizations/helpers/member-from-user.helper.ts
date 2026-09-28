import type { UserResponse } from "@/types";
import type {
  MemberResponse,
  UpdateMemberInput,
  UpsertMemberInput,
} from "@/features/organizations/types/organization.types";
import { isStellarPublicKey } from "@/helpers/stellar.helper";
import {
  getUserDisplayName,
  getUserEmailLabel,
} from "@/helpers/user-display.helper";

export function normalizeSubjectWalletAddress(
  walletAddress?: string | null,
): string | undefined {
  const trimmed = walletAddress?.trim() ?? "";
  if (!trimmed || !isStellarPublicKey(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function buildSubjectWalletPatch(
  member: MemberResponse,
  walletAddress?: string | null,
): UpdateMemberInput | null {
  const nextWallet = normalizeSubjectWalletAddress(walletAddress);
  if (!nextWallet) {
    return null;
  }

  if (normalizeSubjectWalletAddress(member.walletAddress)) {
    return null;
  }

  return { walletAddress: nextWallet };
}

export function getUserCommandValue(user: UserResponse): string {
  const email = user.email?.trim();
  return [getUserDisplayName(user), email, user.id].filter(Boolean).join(" ");
}

export function mapUserToMemberInput(
  user: UserResponse,
  walletAddress?: string | null,
): UpsertMemberInput {
  const email = user.email?.trim();
  const wallet = normalizeSubjectWalletAddress(walletAddress);

  return {
    externalId: user.id,
    label: getUserDisplayName(user),
    metadata: email ? { email } : undefined,
    ...(wallet ? { walletAddress: wallet } : {}),
  };
}

export function buildMemberFromUser(
  user: UserResponse,
  organizationId: string,
  walletAddress?: string | null,
): MemberResponse {
  const email = user.email?.trim();
  const wallet = normalizeSubjectWalletAddress(walletAddress);

  return {
    id: user.id,
    platformId: organizationId,
    externalId: user.id,
    label: getUserDisplayName(user),
    walletAddress: wallet ?? null,
    metadata: email ? { email } : null,
  };
}

export function withCurrentUserMember(
  members: MemberResponse[],
  user: UserResponse | null | undefined,
  organizationId: string,
  walletAddress?: string | null,
): MemberResponse[] {
  if (!user) {
    return members;
  }

  if (
    members.some((member) => isMemberLinkedToUser(member, user, walletAddress))
  ) {
    return members;
  }

  return [buildMemberFromUser(user, organizationId, walletAddress), ...members];
}

function getMemberMetadataEmail(member: MemberResponse): string | null {
  const email = member.metadata?.email;
  return typeof email === "string" && email.trim().length > 0
    ? email.trim()
    : null;
}

export function isMemberLinkedToUser(
  member: MemberResponse,
  user: UserResponse,
  walletAddress?: string | null,
): boolean {
  const externalId = member.externalId?.trim();
  if (externalId && externalId === user.id) {
    return true;
  }

  const userEmail = user.email?.trim().toLowerCase();
  const memberEmail = getMemberMetadataEmail(member)?.toLowerCase();
  if (userEmail && memberEmail && memberEmail === userEmail) {
    return true;
  }

  const memberWallet = member.walletAddress?.trim();
  const connectedWallet = walletAddress?.trim();
  if (memberWallet && connectedWallet && memberWallet === connectedWallet) {
    return true;
  }

  return false;
}

export function isUserAlreadyMember(
  user: UserResponse,
  members: MemberResponse[],
): boolean {
  return members.some((member) => {
    const externalId = member.externalId?.trim();
    if (externalId && externalId === user.id) {
      return true;
    }

    const userEmail = user.email?.trim().toLowerCase();
    const memberEmail = getMemberMetadataEmail(member)?.toLowerCase();
    if (userEmail && memberEmail && memberEmail === userEmail) {
      return true;
    }

    return false;
  });
}

export function getUserSecondaryLabel(user: UserResponse): string {
  const email = user.email?.trim();
  if (email) {
    return email;
  }
  return getUserEmailLabel(user);
}
