export type {
  EntityId,
  IsoDateTimeString,
  StellarAddress,
  AccountRole,
  WithAccountRoles,
  WithEntityTimestamps,
  UserProfileFields,
  UserResponse,
  Sep10Challenge,
  RegisteredSessionChallenge,
  UnregisteredSessionChallenge,
  SessionChallengeResponse,
} from "@/types";

export {
  ACCOUNT_ROLES,
  isAccountRole,
  isRegisteredSessionChallenge,
  isUnregisteredSessionChallenge,
} from "@/types";

import type {
  EntityId,
  IsoDateTimeString,
  StellarAddress,
  WithAccountRoles,
  WithEntityTimestamps,
  UserProfileFields,
  UserResponse,
} from "@/types";

// ─── Session auth ───────────────────────────────────────────────────────────

export interface SessionVerifyResponse {
  token: string;
  expiresAt: IsoDateTimeString;
}

export type AuthenticatedSessionStatus = {
  readonly authenticated: true;
  expiresAt: IsoDateTimeString;
};

export type UnauthenticatedSessionStatus = {
  readonly authenticated: false;
  expiresAt?: IsoDateTimeString;
};

export type SessionStatusResponse =
  | AuthenticatedSessionStatus
  | UnauthenticatedSessionStatus;

export function isAuthenticatedSession(
  status: SessionStatusResponse,
): status is AuthenticatedSessionStatus {
  return status.authenticated;
}

export type SessionMeResponse =
  | (AuthenticatedSessionStatus & { user: UserResponse })
  | UnauthenticatedSessionStatus;

export function isSessionMeResponse(value: unknown): value is SessionMeResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "authenticated" in value &&
    typeof (value as SessionMeResponse).authenticated === "boolean"
  );
}

// ─── API key (registration response) ────────────────────────────────────────

export interface GeneratedApiKeyResponse
  extends WithAccountRoles, Pick<WithEntityTimestamps, "createdAt"> {
  apiKey: string;
  id: EntityId;
  userId: EntityId;
}

// ─── Register profile ───────────────────────────────────────────────────────

export type RegisterProfileInput = Required<
  Pick<UserProfileFields, "firstName" | "email">
> &
  Partial<Pick<UserProfileFields, "lastName">> & {
    organizationName: string;
  };

// ─── Auth requests (hierarchy) ──────────────────────────────────────────────

export interface AuthChallengeRequest {
  address: StellarAddress;
}

export interface AuthVerifyRequest extends AuthChallengeRequest {
  signedXdr: string;
}

export interface RegisterVerifyRequest extends AuthVerifyRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

// ─── Compile-time contracts (zero runtime cost) ─────────────────────────────

type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

type ExpectTrue<T extends true> = T;

type _RegisterProfileShape = ExpectTrue<
  AssertEqual<
    RegisterProfileInput,
    Required<Pick<UserProfileFields, "firstName" | "email">> &
      Partial<Pick<UserProfileFields, "lastName">> & {
        organizationName: string;
      }
  >
>;
