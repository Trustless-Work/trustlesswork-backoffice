import { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { coreFetch } from "@/lib/core-fetch";
import {
  parseJsonBody,
  proxyCoreResponse,
  validateSameOrigin,
} from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import type { UpdateProfileInput } from "@/features/settings/schemas/profile.schema";
import type { UserResponse } from "@/types";

export async function PATCH(request: NextRequest) {
  const csrfError = validateSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const network = parseRequestNetwork(request);
  const meResponse = await coreFetch("/users/me", { network });
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

  const profileResponse = await adminFetch(`/admin/users/${me.id}`, {
    method: "PATCH",
    body: JSON.stringify(profilePayload),
    network,
  });

  return proxyCoreResponse(profileResponse);
}
