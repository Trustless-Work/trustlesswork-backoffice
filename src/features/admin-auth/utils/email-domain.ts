/**
 * Extracts the domain part of an email address, lowercased, with a single
 * trailing dot removed.
 *
 * Uses `lastIndexOf("@")` so `a@b@example.com` resolves to `example.com`,
 * matching how mail systems parse it rather than yielding `b@example.com`.
 */
export function extractEmailDomain(
  email: string | null | undefined,
): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim();
  const separatorIndex = trimmed.lastIndexOf("@");

  // Reject "no @", "@domain" (empty local part) and "local@" (empty domain).
  if (separatorIndex <= 0 || separatorIndex === trimmed.length - 1) {
    return null;
  }

  const domain = trimmed.slice(separatorIndex + 1).toLowerCase();
  const normalized = domain.endsWith(".") ? domain.slice(0, -1) : domain;

  return normalized.length > 0 ? normalized : null;
}

/**
 * Exact, case-insensitive domain equality for the /admin allowlist.
 *
 * Deliberately NOT `endsWith`:
 *   endsWith("trustlesswork.com")  accepts nottrustlesswork.com   ✗
 *   endsWith(".trustlesswork.com") accepts evil.trustlesswork.com ✗
 *
 * Subdomains are rejected: only `user@<allowedDomain>` is allowed.
 */
export function matchesAllowedEmailDomain(
  email: string | null | undefined,
  allowedDomain: string | null | undefined,
): boolean {
  const domain = extractEmailDomain(email);
  if (domain === null) {
    return false;
  }

  if (typeof allowedDomain !== "string") {
    return false;
  }

  const allowed = allowedDomain.trim().toLowerCase();
  if (allowed.length === 0) {
    return false;
  }

  return domain === allowed;
}
