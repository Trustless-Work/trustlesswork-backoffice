import { NextRequest } from "next/server";
import {
  identityOperatorFetch,
  identitySessionFetch,
} from "@/lib/identity-fetch";
import {
  parseJsonBody,
  proxyCoreResponse,
  validateSameOrigin,
} from "@/lib/bff-utils";
import type { UpdateProfileInput } from "@/features/settings/schemas/profile.schema";
import type { UserResponse } from "@/types";

export async function PATCH(request: NextRequest) {
  const csrfError = validateSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const meResponse = await identitySessionFetch("/users/me");
  if (!meResponse.ok) {
    return proxyCoreResponse(meResponse);
  }

  const me = (await meResponse.json()) as UserResponse;
  const body = await parseJsonBody<UpdateProfileInput>(request);

  const firstName = body.firstName?.trim();
  if (!firstName) {
    return proxyCoreResponse(
      new Response(
        JSON.stringify({
          status: 400,
          code: "BAD_REQUEST",
          detail: "firstName is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
  }

  const profilePayload: UpdateProfileInput = { firstName };

  const lastName = body.lastName?.trim();
  if (lastName) {
    profilePayload.lastName = lastName;
  }

  const email = body.email?.trim();
  if (email) {
    profilePayload.email = email;
  }

  const profileResponse = await identityOperatorFetch(`/admin/users/${me.id}`, {
    method: "PATCH",
    body: JSON.stringify(profilePayload),
  });

  return proxyCoreResponse(profileResponse);
}
