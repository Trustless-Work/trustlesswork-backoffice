import { NextResponse } from "next/server";
import type { ProblemDetails } from "@/lib/api-error";
import type { AdminSessionRejectionReason } from "@/features/admin-auth/types/admin-auth.types";

const REJECTION_MESSAGES: Record<AdminSessionRejectionReason, string> = {
  unauthenticated: "Admin session required",
  mfa_required: "Multi-factor authentication required",
  forbidden_domain: "Email domain is not allowed for backoffice access",
  not_an_admin: "Account does not have backoffice admin privileges",
};

export function createAdminForbiddenResponse(
  reason: AdminSessionRejectionReason,
): NextResponse {
  const status = reason === "unauthenticated" ? 401 : 403;
  const body: ProblemDetails = {
    status,
    code: reason === "unauthenticated" ? "AUTH_CREDENTIAL_MISSING" : "FORBIDDEN",
    detail: REJECTION_MESSAGES[reason],
  };
  return NextResponse.json(body, { status });
}

export const DEFAULT_ANALYTICS_MONTHS = 12;
export const MIN_ANALYTICS_MONTHS = 1;
export const MAX_ANALYTICS_MONTHS = 36;

export type AnalyticsGranularity = "day" | "week" | "month";

const ANALYTICS_GRANULARITIES = new Set<AnalyticsGranularity>([
  "day",
  "week",
  "month",
]);

const DEFAULT_PERIODS: Record<AnalyticsGranularity, number> = {
  month: 12,
  week: 12,
  day: 30,
};

const MAX_PERIODS: Record<AnalyticsGranularity, number> = {
  month: 36,
  week: 156,
  day: 366,
};

export type ParsedAnalyticsSeriesParams = {
  readonly granularity: AnalyticsGranularity;
  readonly periods: number;
};

type ParseSeriesResult =
  | { readonly ok: true; readonly value: ParsedAnalyticsSeriesParams }
  | { readonly ok: false; readonly error: NextResponse };

function parseGranularity(raw: string | null): AnalyticsGranularity | null {
  if (raw === null || raw.trim() === "") {
    return "month";
  }
  const normalized = raw.trim().toLowerCase();
  return ANALYTICS_GRANULARITIES.has(normalized as AnalyticsGranularity)
    ? (normalized as AnalyticsGranularity)
    : null;
}

function parsePeriodsValue(
  raw: string,
  granularity: AnalyticsGranularity,
): number | null {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  if (parsed > MAX_PERIODS[granularity]) {
    return null;
  }
  return parsed;
}

export function parseAnalyticsSeriesParams(
  searchParams: URLSearchParams,
): ParseSeriesResult {
  const granularity = parseGranularity(searchParams.get("granularity"));
  if (!granularity) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: "granularity must be one of day, week, or month",
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  const periodsRaw = searchParams.get("periods");
  if (periodsRaw !== null && periodsRaw.trim() !== "") {
    const periods = parsePeriodsValue(periodsRaw.trim(), granularity);
    if (periods === null) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: `periods must be an integer between 1 and ${MAX_PERIODS[granularity]} for granularity=${granularity}`,
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    return { ok: true, value: { granularity, periods } };
  }

  const monthsRaw = searchParams.get("months");
  if (monthsRaw !== null && monthsRaw.trim() !== "") {
    const months = parseMonthsParam(monthsRaw);
    if (!months.ok) {
      return { ok: false, error: months.error };
    }
    if (granularity !== "month") {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "months is only valid with granularity=month",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    return {
      ok: true,
      value: { granularity: "month", periods: months.value },
    };
  }

  return {
    ok: true,
    value: { granularity, periods: DEFAULT_PERIODS[granularity] },
  };
}

export const DEFAULT_REVENUE_EVENTS_LIMIT = 50;
export const MIN_REVENUE_EVENTS_LIMIT = 1;
export const MAX_REVENUE_EVENTS_LIMIT = 200;

export type ParsedRevenueEventsParams = {
  readonly limit: number;
  readonly offset: number;
  readonly from?: string;
  readonly to?: string;
  readonly eventType?: "release" | "resolve_dispute";
  readonly sort?: "timestamp" | "amount";
  readonly order?: "desc" | "asc";
  readonly search?: string;
  readonly asset?: string;
};

type ParseRevenueEventsResult =
  | { readonly ok: true; readonly value: ParsedRevenueEventsParams }
  | { readonly ok: false; readonly error: NextResponse };

function isValidIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

export type ParsedRangeParams = {
  readonly from?: string;
  readonly to?: string;
};

type ParseRangeResult =
  | { readonly ok: true; readonly value: ParsedRangeParams }
  | { readonly ok: false; readonly error: NextResponse };

export function parseRangeParams(
  searchParams: URLSearchParams,
): ParseRangeResult {
  const from = searchParams.get("from")?.trim();
  if (from && !isValidIsoDateTime(from)) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: "from must be a valid ISO 8601 datetime",
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  const to = searchParams.get("to")?.trim();
  if (to && !isValidIsoDateTime(to)) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: "to must be a valid ISO 8601 datetime",
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  return {
    ok: true,
    value: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  };
}

export const MIN_ANALYTICS_TOP_LIMIT = 1;
export const MAX_ANALYTICS_TOP_LIMIT = 50;
export const DEFAULT_ANALYTICS_TOP_LIMIT = 10;

export type ParsedAnalyticsTopParams = ParsedRangeParams & {
  readonly by: string;
  readonly limit: number;
};

type ParseAnalyticsTopResult =
  | { readonly ok: true; readonly value: ParsedAnalyticsTopParams }
  | { readonly ok: false; readonly error: NextResponse };

export function parseAnalyticsTopParams(
  searchParams: URLSearchParams,
  allowedBy: readonly string[],
): ParseAnalyticsTopResult {
  const rangeParsed = parseRangeParams(searchParams);
  if (!rangeParsed.ok) {
    return rangeParsed;
  }

  const byRaw = searchParams.get("by")?.trim();
  if (!byRaw || !allowedBy.includes(byRaw)) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: `by must be one of: ${allowedBy.join(", ")}`,
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  const limitRaw = searchParams.get("limit");
  let limit = DEFAULT_ANALYTICS_TOP_LIMIT;
  if (limitRaw !== null && limitRaw.trim() !== "") {
    const parsed = Number(limitRaw);
    if (
      !Number.isInteger(parsed) ||
      parsed < MIN_ANALYTICS_TOP_LIMIT ||
      parsed > MAX_ANALYTICS_TOP_LIMIT
    ) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: `limit must be an integer between ${MIN_ANALYTICS_TOP_LIMIT} and ${MAX_ANALYTICS_TOP_LIMIT}`,
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    limit = parsed;
  }

  return {
    ok: true,
    value: {
      by: byRaw,
      limit,
      ...rangeParsed.value,
    },
  };
}

export function parseRevenueEventsParams(
  searchParams: URLSearchParams,
): ParseRevenueEventsResult {
  const limitRaw = searchParams.get("limit");
  let limit = DEFAULT_REVENUE_EVENTS_LIMIT;
  if (limitRaw !== null && limitRaw.trim() !== "") {
    const parsed = Number(limitRaw);
    if (
      !Number.isInteger(parsed) ||
      parsed < MIN_REVENUE_EVENTS_LIMIT ||
      parsed > MAX_REVENUE_EVENTS_LIMIT
    ) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: `limit must be an integer between ${MIN_REVENUE_EVENTS_LIMIT} and ${MAX_REVENUE_EVENTS_LIMIT}`,
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    limit = parsed;
  }

  const offsetRaw = searchParams.get("offset");
  let offset = 0;
  if (offsetRaw !== null && offsetRaw.trim() !== "") {
    const parsed = Number(offsetRaw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "offset must be a non-negative integer",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    offset = parsed;
  }

  const from = searchParams.get("from")?.trim();
  if (from && !isValidIsoDateTime(from)) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: "from must be a valid ISO 8601 datetime",
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  const to = searchParams.get("to")?.trim();
  if (to && !isValidIsoDateTime(to)) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: "to must be a valid ISO 8601 datetime",
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  const eventTypeRaw = searchParams.get("eventType")?.trim();
  let eventType: ParsedRevenueEventsParams["eventType"];
  if (eventTypeRaw) {
    if (eventTypeRaw !== "release" && eventTypeRaw !== "resolve_dispute") {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "eventType must be release or resolve_dispute",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    eventType = eventTypeRaw;
  }

  const sortRaw = searchParams.get("sort")?.trim();
  let sort: ParsedRevenueEventsParams["sort"];
  if (sortRaw) {
    if (sortRaw !== "timestamp" && sortRaw !== "amount") {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "sort must be timestamp or amount",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    sort = sortRaw;
  }

  const orderRaw = searchParams.get("order")?.trim();
  let order: ParsedRevenueEventsParams["order"];
  if (orderRaw) {
    if (orderRaw !== "desc" && orderRaw !== "asc") {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "order must be desc or asc",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    order = orderRaw;
  }

  const searchRaw = searchParams.get("search")?.trim();
  let search: string | undefined;
  if (searchRaw) {
    if (searchRaw.length > 100) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "search must be at most 100 characters",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    search = searchRaw;
  }

  const assetRaw = searchParams.get("asset")?.trim();
  let asset: string | undefined;
  if (assetRaw) {
    if (assetRaw.length === 0) {
      const body: ProblemDetails = {
        status: 400,
        code: "VALIDATION_ERROR",
        detail: "asset must be a non-empty token contract id",
      };
      return { ok: false, error: NextResponse.json(body, { status: 400 }) };
    }
    asset = assetRaw;
  }

  return {
    ok: true,
    value: {
      limit,
      offset,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(eventType ? { eventType } : {}),
      ...(sort ? { sort } : {}),
      ...(order ? { order } : {}),
      ...(search ? { search } : {}),
      ...(asset ? { asset } : {}),
    },
  };
}

type ParseMonthsResult =
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly error: NextResponse };

export function parseMonthsParam(
  raw: string | null,
  defaultValue = DEFAULT_ANALYTICS_MONTHS,
): ParseMonthsResult {
  if (raw === null || raw.trim() === "") {
    return { ok: true, value: defaultValue };
  }

  const parsed = Number(raw);
  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_ANALYTICS_MONTHS ||
    parsed > MAX_ANALYTICS_MONTHS
  ) {
    const body: ProblemDetails = {
      status: 400,
      code: "VALIDATION_ERROR",
      detail: `months must be an integer between ${MIN_ANALYTICS_MONTHS} and ${MAX_ANALYTICS_MONTHS}`,
    };
    return { ok: false, error: NextResponse.json(body, { status: 400 }) };
  }

  return { ok: true, value: parsed };
}
