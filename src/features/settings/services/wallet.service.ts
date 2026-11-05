import http from "@/lib/http";
import type { ChallengeNetwork } from "@/features/auth/lib/challenge-network";
import type { Sep10Challenge } from "@/types";
import type {
  UserWalletResponse,
  WalletLinkVerifyResponse,
} from "@/features/settings/types/wallet.types";
import {
  buildKeysetQuery,
  fetchAllKeysetPages,
} from "@/lib/pagination";
import { userWalletResponseSchema } from "@/lib/schemas/api-response.schemas";
import { parseKeysetPageWithSchema } from "@/lib/schemas/keyset-page.schema";
import type { KeysetListParams, KeysetPage } from "@/types/pagination.entity";

export class WalletService {
  async listWalletsPage(
    params: KeysetListParams = {},
  ): Promise<KeysetPage<UserWalletResponse>> {
    const { data } = await http.get<unknown>(
      `/identity/users/me/wallets${buildKeysetQuery(params)}`,
    );
    return parseKeysetPageWithSchema(userWalletResponseSchema, data);
  }

  async listWallets(): Promise<UserWalletResponse[]> {
    return fetchAllKeysetPages((params) => this.listWalletsPage(params));
  }

  async requestLinkChallenge(
    address: string,
    network: ChallengeNetwork,
  ): Promise<Sep10Challenge> {
    const { data } = await http.post<Sep10Challenge>(
      "/identity/wallets/link/challenge",
      { address, network },
    );
    return data;
  }

  async verifyLink(
    address: string,
    signedXdr: string,
  ): Promise<WalletLinkVerifyResponse> {
    const { data } = await http.post<WalletLinkVerifyResponse>(
      "/identity/wallets/link/verify",
      { address, signedXdr },
    );
    return data;
  }

  async unlinkWallet(address: string): Promise<void> {
    await http.delete(`/identity/users/me/wallets/${encodeURIComponent(address)}`);
  }
}

export const walletService = new WalletService();
