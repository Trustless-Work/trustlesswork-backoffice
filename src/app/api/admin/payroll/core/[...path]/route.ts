import { NextRequest } from "next/server";
import { getAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { createAdminForbiddenResponse } from "@/lib/admin-session-response";
import { proxyCoreResponse, validateSameOrigin } from "@/lib/bff-utils";
import { payrollFetch } from "@/lib/payroll-fetch";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return handlePayrollCoreProxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handlePayrollCoreProxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handlePayrollCoreProxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handlePayrollCoreProxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handlePayrollCoreProxy(request, context);
}

async function handlePayrollCoreProxy(
  request: NextRequest,
  context: RouteContext,
) {
  const csrfError = validateSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const { path } = await context.params;
  const corePath = `/${path.join("/")}`;
  const search = request.nextUrl.search;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
  };

  const platformId = request.headers.get("x-tw-platform");
  if (platformId) {
    headers["X-TW-Platform"] = platformId;
  }

  const subjectId = request.headers.get("x-tw-subject");
  if (subjectId) {
    headers["X-TW-Subject"] = subjectId;
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) {
      init.body = body;
    }
  }

  const response = await payrollFetch(`${corePath}${search}`, init);
  return proxyCoreResponse(response);
}
