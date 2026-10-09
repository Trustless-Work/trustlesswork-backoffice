import type { GeneratedApiKeyResponse } from "@/features/auth/types/auth.types";
import type {
  ApiKeyResponse,
  CreateApiKeyInput,
} from "@/features/api-keys/types/api-key.types";
import http from "@/lib/http";
import {
  buildKeysetQuery,
  fetchAllKeysetPages,
} from "@/lib/pagination";
import { apiKeyResponseSchema } from "@/lib/schemas/api-response.schemas";
import { parseKeysetPageWithSchema } from "@/lib/schemas/keyset-page.schema";
import type { KeysetListParams, KeysetPage } from "@/types/pagination.entity";
import type { NetworkType } from "@/types/network.entity";

function networkHeaders(network: NetworkType) {
  return { headers: { "x-network": network } };
}

export class ApiKeyService {
  async listApiKeysPage(
    params: KeysetListParams = {},
    network: NetworkType,
  ): Promise<KeysetPage<ApiKeyResponse>> {
    const { data } = await http.get<unknown>(
      `/core/users/me/api-keys${buildKeysetQuery(params)}`,
      networkHeaders(network),
    );
    return parseKeysetPageWithSchema(apiKeyResponseSchema, data);
  }

  async listApiKeys(network: NetworkType): Promise<ApiKeyResponse[]> {
    return fetchAllKeysetPages((params) =>
      this.listApiKeysPage(params, network),
    );
  }

  async createApiKey(
    payload: CreateApiKeyInput,
    network: NetworkType,
  ): Promise<GeneratedApiKeyResponse> {
    const { data } = await http.post<GeneratedApiKeyResponse>(
      "/core/users/me/api-keys",
      payload,
      networkHeaders(network),
    );
    return data;
  }

  async rotateApiKey(
    keyId: string,
    network: NetworkType,
  ): Promise<GeneratedApiKeyResponse> {
    const { data } = await http.post<GeneratedApiKeyResponse>(
      `/core/users/me/api-keys/${encodeURIComponent(keyId)}/rotate`,
      undefined,
      networkHeaders(network),
    );
    return data;
  }

  async revokeApiKey(keyId: string, network: NetworkType): Promise<void> {
    await http.put(
      `/core/users/me/api-keys/${encodeURIComponent(keyId)}/revoke`,
      undefined,
      networkHeaders(network),
    );
  }
}

export const apiKeyService = new ApiKeyService();
