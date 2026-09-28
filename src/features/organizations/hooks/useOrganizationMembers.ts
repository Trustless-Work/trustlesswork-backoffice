"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  buildSubjectWalletPatch,
  isMemberLinkedToUser,
  mapUserToMemberInput,
  withCurrentUserMember,
} from "@/features/organizations/helpers/member-from-user.helper";
import { organizationService } from "@/features/organizations/services/organization.service";
import { flattenKeysetPages } from "@/lib/pagination";
import { DEFAULT_KEYSET_LIMIT } from "@/types/pagination.entity";
import { useAuth } from "@/providers/AuthProvider";
import { useWalletContext } from "@/providers/WalletProvider";

export function organizationMembersQueryKey(organizationId: string) {
  return ["organizations", organizationId, "members"] as const;
}

export function useOrganizationMembers(organizationId: string | null) {
  const query = useInfiniteQuery({
    queryKey: organizationId
      ? organizationMembersQueryKey(organizationId)
      : ["organizations", "members", "none"],
    queryFn: ({ pageParam }) => {
      if (!organizationId) {
        return Promise.resolve({
          data: [],
          hasMore: false,
          nextCursor: null,
        });
      }

      return organizationService.listMembersPage(organizationId, {
        limit: DEFAULT_KEYSET_LIMIT,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(organizationId),
  });

  const members = useMemo(() => flattenKeysetPages(query.data), [query.data]);

  return {
    ...query,
    members,
  };
}

export function useOrganizationMembersDisplay(organizationId: string | null) {
  const queryClient = useQueryClient();
  const query = useOrganizationMembers(organizationId);
  const { user } = useAuth();
  const { walletAddress, hasWalletHydrated } = useWalletContext();
  const subjectSyncRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !organizationId ||
      !user ||
      !hasWalletHydrated ||
      !query.isSuccess ||
      query.isFetching
    ) {
      return;
    }

    const linkedMember = query.members.find((member) =>
      isMemberLinkedToUser(member, user, walletAddress),
    );

    const invalidateMembers = () =>
      queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(organizationId),
      });

    if (!linkedMember) {
      const syncKey = `create:${organizationId}:${user.id}`;
      if (subjectSyncRef.current === syncKey) {
        return;
      }

      subjectSyncRef.current = syncKey;
      void organizationService
        .upsertMember(
          organizationId,
          mapUserToMemberInput(user, walletAddress),
        )
        .then(invalidateMembers)
        .catch(() => {
          subjectSyncRef.current = null;
        });
      return;
    }

    const walletPatch = buildSubjectWalletPatch(linkedMember, walletAddress);
    if (!walletPatch?.walletAddress) {
      return;
    }

    const syncKey = `wallet:${organizationId}:${linkedMember.id}:${walletPatch.walletAddress}`;
    if (subjectSyncRef.current === syncKey) {
      return;
    }

    subjectSyncRef.current = syncKey;
    void organizationService
      .updateMember(organizationId, linkedMember.id, walletPatch)
      .then(invalidateMembers)
      .catch(() => {
        subjectSyncRef.current = null;
      });
  }, [
    hasWalletHydrated,
    organizationId,
    query.isFetching,
    query.isSuccess,
    query.members,
    queryClient,
    user,
    walletAddress,
  ]);

  const members = useMemo(
    () =>
      organizationId
        ? withCurrentUserMember(
            query.members,
            user,
            organizationId,
            walletAddress,
          )
        : [],
    [organizationId, query.members, user, walletAddress],
  );

  return {
    ...query,
    members,
  };
}
