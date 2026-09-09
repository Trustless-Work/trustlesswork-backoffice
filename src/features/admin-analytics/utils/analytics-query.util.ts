import { isApiError } from "@/lib/api-error";

export const ADMIN_ANALYTICS_STALE_TIME = 30_000;
export const ADMIN_ANALYTICS_REFETCH_INTERVAL = 60_000;

export function adminAnalyticsQueryKey(
  endpoint: string,
  ...params: readonly (string | number)[]
) {
  return ["admin-analytics", endpoint, ...params] as const;
}

export function getAdminAnalyticsErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const requiredRoles = error.extensions?.requiredAnyOf;
    if (
      error.status === 403 &&
      Array.isArray(requiredRoles) &&
      requiredRoles.some((role) => role === "BACKOFFICE_ADMIN")
    ) {
      return "The server API key lacks the BACKOFFICE_ADMIN role. Contact your operator.";
    }

    if (error.status === 401) {
      return "Your admin session expired. Sign in again.";
    }

    return error.detail;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load analytics data.";
}

export function shouldRetryAdminAnalytics(failureCount: number, error: unknown) {
  if (isApiError(error) && error.status === 403) {
    return false;
  }
  return failureCount < 2;
}
