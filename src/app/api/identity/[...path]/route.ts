import { NextRequest, NextResponse } from "next/server";
import { proxyCoreResponse, validateSameOrigin } from "@/lib/bff-utils";
import { identitySessionFetch } from "@/lib/identity-fetch";
import { isAllowedIdentityRoute } from "@/lib/identity-proxy";
import type { ProblemDetails } from "@/lib/api-error";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return handleIdentityProxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleIdentityProxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleIdentityProxy(request, context);
}

async function handleIdentityProxy(
  request: NextRequest,
  context: RouteContext,
) {
  const csrfError = validateSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const { path } = await context.params;
  const identityPath = `/${path.map(encodeURIComponent).join("/")}`;

  if (!isAllowedIdentityRoute(request.method, identityPath)) {
    const body: ProblemDetails = {
      status: 404,
      code: "NOT_FOUND",
      detail: "Route not found",
    };
    return NextResponse.json(body, { status: 404 });
  }

  const init: RequestInit = { method: request.method };

  if (request.method === "POST") {
    const body = await request.text();
    if (body) {
      init.body = body;
    }
  }

  const response = await identitySessionFetch(
    `${identityPath}${request.nextUrl.search}`,
    init,
  );
  return proxyCoreResponse(response);
}
