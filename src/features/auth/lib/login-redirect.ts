const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export function sanitizeLoginRedirect(raw: string | null): string {
  const value = raw?.trim() ?? "";

  const isRootRelative = value.startsWith("/") && !value.startsWith("//");
  if (!isRootRelative || value.includes("\\") || value.includes("://")) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return value;
}
