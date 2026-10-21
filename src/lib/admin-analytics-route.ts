import type { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { proxyCoreResponse } from "@/lib/bff-utils";
import { getAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import {
  createAdminForbiddenResponse,
  parseAnalyticsSeriesParams,
  parseAnalyticsTopParams,
  parseOptionalContractVersionParam,
  parseRangeParams,
  parseRevenueEventsParams,
} from "@/lib/admin-session-response";
import type { ContractVersionFilter } from "@/types";

export async function handleAdminAnalyticsGet(
  request: NextRequest,
  corePath: string,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const network = parseRequestNetwork(request);
  const response = await adminFetch(corePath, { network });
  return proxyCoreResponse(response);
}

function buildSeriesQuery(params: {
  granularity: string;
  periods: number;
}): URLSearchParams {
  return new URLSearchParams({
    granularity: params.granularity,
    periods: String(params.periods),
  });
}

type AnalyticsProxyOptions = {
  readonly forwardContractVersion?: boolean;
};

function applyContractVersion(
  query: URLSearchParams,
  contractVersion: ContractVersionFilter | undefined,
): URLSearchParams {
  if (contractVersion) {
    query.set("contractVersion", contractVersion);
  }
  return query;
}

function readForwardedContractVersion(
  request: NextRequest,
  options?: AnalyticsProxyOptions,
):
  | { readonly ok: true; readonly value: ContractVersionFilter | undefined }
  | { readonly ok: false; readonly error: Response } {
  if (!options?.forwardContractVersion) {
    return { ok: true, value: undefined };
  }

  return parseOptionalContractVersionParam(request.nextUrl.searchParams);
}

export async function handleAdminAnalyticsMonthlyGet(
  request: NextRequest,
  corePath: string,
  options?: AnalyticsProxyOptions,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const parsed = parseAnalyticsSeriesParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return parsed.error;
  }

  const contractVersion = readForwardedContractVersion(request, options);
  if (!contractVersion.ok) {
    return contractVersion.error;
  }

  const query = applyContractVersion(
    buildSeriesQuery(parsed.value),
    contractVersion.value,
  );
  const network = parseRequestNetwork(request);
  const response = await adminFetch(`${corePath}?${query.toString()}`, {
    network,
  });
  return proxyCoreResponse(response);
}

export async function handleAdminAnalyticsRevenueEventsGet(
  request: NextRequest,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const parsed = parseRevenueEventsParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return parsed.error;
  }

  const query = new URLSearchParams({
    limit: String(parsed.value.limit),
    offset: String(parsed.value.offset),
  });
  if (parsed.value.from) {
    query.set("from", parsed.value.from);
  }
  if (parsed.value.to) {
    query.set("to", parsed.value.to);
  }
  if (parsed.value.eventType) {
    query.set("eventType", parsed.value.eventType);
  }
  if (parsed.value.sort) {
    query.set("sort", parsed.value.sort);
  }
  if (parsed.value.order) {
    query.set("order", parsed.value.order);
  }
  if (parsed.value.search) {
    query.set("search", parsed.value.search);
  }
  if (parsed.value.asset) {
    query.set("asset", parsed.value.asset);
  }

  const contractVersion = parseOptionalContractVersionParam(
    request.nextUrl.searchParams,
  );
  if (!contractVersion.ok) {
    return contractVersion.error;
  }
  applyContractVersion(query, contractVersion.value);

  const network = parseRequestNetwork(request);
  const response = await adminFetch(
    `/analytics/revenue/events?${query.toString()}`,
    { network },
  );
  return proxyCoreResponse(response);
}

function appendRangeQuery(
  base: URLSearchParams,
  range: { from?: string; to?: string },
): URLSearchParams {
  const query = new URLSearchParams(base);
  if (range.from) {
    query.set("from", range.from);
  }
  if (range.to) {
    query.set("to", range.to);
  }
  return query;
}

export async function handleAdminAnalyticsRangeGet(
  request: NextRequest,
  corePath: string,
  options?: AnalyticsProxyOptions,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const parsed = parseRangeParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return parsed.error;
  }

  const contractVersion = readForwardedContractVersion(request, options);
  if (!contractVersion.ok) {
    return contractVersion.error;
  }

  const query = applyContractVersion(
    appendRangeQuery(new URLSearchParams(), parsed.value),
    contractVersion.value,
  );
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const network = parseRequestNetwork(request);
  const response = await adminFetch(`${corePath}${suffix}`, { network });
  return proxyCoreResponse(response);
}

export async function handleAdminAnalyticsTopGet(
  request: NextRequest,
  corePath: string,
  allowedBy: readonly string[],
  options?: AnalyticsProxyOptions,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const parsed = parseAnalyticsTopParams(
    request.nextUrl.searchParams,
    allowedBy,
  );
  if (!parsed.ok) {
    return parsed.error;
  }

  const contractVersion = readForwardedContractVersion(request, options);
  if (!contractVersion.ok) {
    return contractVersion.error;
  }

  const query = applyContractVersion(
    appendRangeQuery(
      new URLSearchParams({
        by: parsed.value.by,
        limit: String(parsed.value.limit),
      }),
      parsed.value,
    ),
    contractVersion.value,
  );
  const network = parseRequestNetwork(request);
  const response = await adminFetch(`${corePath}?${query.toString()}`, {
    network,
  });
  return proxyCoreResponse(response);
}

export async function handleAdminAnalyticsApiKeyDetailGet(
  request: NextRequest,
  keyId: string,
): Promise<Response> {
  const session = await getAdminSession();
  if (session.status !== "ok") {
    return createAdminForbiddenResponse(session.status);
  }

  const parsed = parseRangeParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return parsed.error;
  }

  const query = appendRangeQuery(new URLSearchParams(), parsed.value);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const network = parseRequestNetwork(request);
  const response = await adminFetch(
    `/analytics/api-keys/${encodeURIComponent(keyId)}${suffix}`,
    { network },
  );
  return proxyCoreResponse(response);
}
