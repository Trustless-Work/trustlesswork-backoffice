import http from "@/lib/http";
import {
  buildKeysetQuery,
  fetchAllKeysetPages,
} from "@/lib/pagination";
import {
  memberResponseSchema,
  organizationResponseSchema,
} from "@/lib/schemas/api-response.schemas";
import { parseKeysetPageWithSchema } from "@/lib/schemas/keyset-page.schema";
import type { KeysetListParams, KeysetPage } from "@/types/pagination.entity";
import { normalizeSubjectWalletAddress } from "@/features/organizations/helpers/member-from-user.helper";
import type {
  CreateOrganizationInput,
  MemberResponse,
  OrganizationResponse,
  UpdateMemberInput,
  UpdateOrganizationInput,
  UpsertMemberInput,
} from "@/features/organizations/types/organization.types";

function sanitizeSubjectWritePayload<T extends { walletAddress?: string }>(
  payload: T,
): T {
  if (payload.walletAddress === undefined) {
    return payload;
  }

  const walletAddress = normalizeSubjectWalletAddress(payload.walletAddress);
  if (!walletAddress) {
    const rest = { ...payload };
    delete rest.walletAddress;
    return rest;
  }

  return { ...payload, walletAddress };
}

export class OrganizationService {
  async listMinePage(
    params: KeysetListParams = {},
  ): Promise<KeysetPage<OrganizationResponse>> {
    const { data } = await http.get<unknown>(
      `/core/users/me/platforms${buildKeysetQuery(params)}`,
    );
    return parseKeysetPageWithSchema(organizationResponseSchema, data);
  }

  async create(
    payload: CreateOrganizationInput,
  ): Promise<OrganizationResponse> {
    const { data } = await http.post<OrganizationResponse>(
      "/core/platforms",
      payload,
    );
    return data;
  }

  async update(
    id: string,
    payload: UpdateOrganizationInput,
  ): Promise<OrganizationResponse> {
    const { data } = await http.patch<OrganizationResponse>(
      `/core/platforms/${encodeURIComponent(id)}`,
      payload,
    );
    return data;
  }

  async archive(id: string): Promise<void> {
    await http.delete(`/core/platforms/${encodeURIComponent(id)}`);
  }

  async listMembersPage(
    organizationId: string,
    params: KeysetListParams = {},
  ): Promise<KeysetPage<MemberResponse>> {
    const { data } = await http.get<unknown>(
      `/core/platforms/${encodeURIComponent(organizationId)}/subjects${buildKeysetQuery(params)}`,
    );
    return parseKeysetPageWithSchema(memberResponseSchema, data);
  }

  async listMembers(organizationId: string): Promise<MemberResponse[]> {
    return fetchAllKeysetPages((params) =>
      this.listMembersPage(organizationId, params),
    );
  }

  async upsertMember(
    organizationId: string,
    payload: UpsertMemberInput,
  ): Promise<MemberResponse> {
    const { data } = await http.post<MemberResponse>(
      `/core/platforms/${organizationId}/subjects`,
      sanitizeSubjectWritePayload(payload),
    );
    return data;
  }

  async updateMember(
    organizationId: string,
    memberId: string,
    payload: UpdateMemberInput,
  ): Promise<MemberResponse> {
    const { data } = await http.patch<MemberResponse>(
      `/core/platforms/${encodeURIComponent(organizationId)}/subjects/${encodeURIComponent(memberId)}`,
      sanitizeSubjectWritePayload(payload),
    );
    return data;
  }

  async archiveMember(organizationId: string, memberId: string): Promise<void> {
    await http.delete(
      `/core/platforms/${encodeURIComponent(organizationId)}/subjects/${encodeURIComponent(memberId)}`,
    );
  }
}

export const organizationService = new OrganizationService();
