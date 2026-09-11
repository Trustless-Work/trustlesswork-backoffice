import { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import type { RegisterVerifyRequest } from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<RegisterVerifyRequest>(request);

  const response = await adminFetch("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({
      address: body.address,
      signedXdr: body.signedXdr,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      organizationName: body.organizationName,
    }),
  });

  return proxyCoreResponse(response);
}
