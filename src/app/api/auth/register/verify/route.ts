import { NextRequest, NextResponse } from "next/server";
import { identityOperatorFetch } from "@/lib/identity-fetch";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import { provisionPlatforms } from "@/lib/provision-platforms";
import { setSessionToken } from "@/lib/session";
import type {
  RegisteredSessionResponse,
  RegisterVerifyRequest,
  RegisterVerifyResult,
} from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<RegisterVerifyRequest>(request);

  const response = await identityOperatorFetch("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({
      address: body.address,
      signedXdr: body.signedXdr,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    }),
  });

  if (!response.ok) {
    return proxyCoreResponse(response);
  }

  const data = (await response.json()) as RegisteredSessionResponse;
  await setSessionToken(data.token, data.expiresAt);

  // The account already exists, so a failure here must not fail registration.
  const platforms = body.organizationName
    ? await provisionPlatforms(body.organizationName, data.token)
    : {};

  const result: RegisterVerifyResult = {
    success: true,
    expiresAt: data.expiresAt,
    organizationProvisioned: platforms[parseRequestNetwork(request)] === true,
  };

  return NextResponse.json(result, { status: 201 });
}
