import { NextRequest, NextResponse } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { parseJsonBody } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import type { ProblemDetails } from "@/lib/api-error";
import type {
  AuthChallengeRequest,
  Sep10Challenge,
} from "@/features/auth/types/auth.types";

const WALLET_NOT_REGISTERED_CODES = new Set([
  "SESSION_WALLET_NOT_REGISTERED",
  "NOT_FOUND",
  "USER_NOT_FOUND",
]);

function isWalletNotRegistered(
  status: number,
  code: string | undefined,
): boolean {
  if (status === 404) {
    return true;
  }

  const normalizedCode = code?.toUpperCase();
  return (
    normalizedCode !== undefined &&
    WALLET_NOT_REGISTERED_CODES.has(normalizedCode)
  );
}

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<AuthChallengeRequest>(request);
  const response = await adminFetch("/auth/session/challenge", {
    method: "POST",
    body: JSON.stringify(body),
    network: parseRequestNetwork(request),
  });

  if (response.ok) {
    const challenge = (await response.json()) as Sep10Challenge;

    return NextResponse.json({
      registered: true,
      xdr: challenge.xdr,
      networkPassphrase: challenge.networkPassphrase,
      expiresAt: challenge.expiresAt,
    });
  }

  const errorBody = (await response
    .json()
    .catch(() => null)) as ProblemDetails | null;

  if (isWalletNotRegistered(response.status, errorBody?.code)) {
    return NextResponse.json({
      registered: false,
      address: body.address,
    });
  }

  return NextResponse.json(
    errorBody ?? {
      status: response.status,
      code: "REQUEST_FAILED",
      detail: "Session challenge request failed",
    },
    { status: response.status },
  );
}
