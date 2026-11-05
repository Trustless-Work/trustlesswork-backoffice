import http from "@/lib/http";
import type { ChallengeNetwork } from "@/features/auth/lib/challenge-network";
import type {
  RegisterProfileInput,
  RegisterVerifyResult,
  Sep10Challenge,
  SessionChallengeResponse,
  SessionMeResponse,
  SessionStatusResponse,
  SessionVerifyResponse,
  UserResponse,
} from "@/features/auth/types/auth.types";

export class AuthService {
  async requestSessionChallenge(
    address: string,
    network: ChallengeNetwork,
  ): Promise<SessionChallengeResponse> {
    const { data } = await http.post<SessionChallengeResponse>(
      "/auth/session/challenge",
      { address, network },
    );
    return data;
  }

  async verifySession(
    address: string,
    signedXdr: string,
  ): Promise<SessionVerifyResponse> {
    const { data } = await http.post<{ success: true; expiresAt: string }>(
      "/auth/session/verify",
      { address, signedXdr },
    );
    return { token: "", expiresAt: data.expiresAt };
  }

  async requestRegisterChallenge(
    address: string,
    network: ChallengeNetwork,
  ): Promise<Sep10Challenge> {
    const { data } = await http.post<Sep10Challenge>(
      "/auth/register/challenge",
      { address, network },
    );
    return data;
  }

  async verifyRegister(
    address: string,
    signedXdr: string,
    profile: RegisterProfileInput,
  ): Promise<RegisterVerifyResult> {
    const { data } = await http.post<RegisterVerifyResult>(
      "/auth/register/verify",
      {
        address,
        signedXdr,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        organizationName: profile.organizationName,
      },
    );

    return data;
  }

  async logout(): Promise<void> {
    await http.post("/auth/session/logout");
  }

  async getSessionUser(): Promise<UserResponse | null> {
    const { data } = await http.get<SessionMeResponse>("/auth/me");

    if (!data.authenticated) {
      return null;
    }

    return data.user;
  }

  async checkSession(): Promise<SessionStatusResponse> {
    const { data } = await http.get<SessionStatusResponse>("/auth/me");
    return data;
  }

  async getMe(): Promise<UserResponse> {
    const { data } = await http.get<UserResponse>("/identity/users/me");
    return data;
  }
}

export const authService = new AuthService();
