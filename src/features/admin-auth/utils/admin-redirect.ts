import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
} from "@/features/admin-auth/constants/admin-auth.constants";

/**
 * Sanitizes the `?redirect=` parameter of the admin login flow.
 *
 * The wallet `/login` flow passes this parameter straight to `router.push`;
 * that open-redirect shape is intentionally not repeated here. Only same-origin
 * paths inside /admin survive — everything else collapses to the admin home.
 */
export function sanitizeAdminRedirect(raw: string | null | undefined): string {
  if (typeof raw !== "string") {
    return ADMIN_HOME_PATH;
  }

  const value = raw.trim();

  // Must be a root-relative path, and not a protocol-relative "//host" one.
  if (!value.startsWith("/") || value.startsWith("//")) {
    return ADMIN_HOME_PATH;
  }

  // Backslashes and scheme separators are normalized by some browsers into
  // host-changing URLs.
  if (value.includes("\\") || value.includes("://")) {
    return ADMIN_HOME_PATH;
  }

  const [pathname] = value.split(/[?#]/, 1);

  if (pathname !== ADMIN_HOME_PATH && !pathname.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return ADMIN_HOME_PATH;
  }

  // Redirecting back to the login page would loop.
  if (pathname === ADMIN_LOGIN_PATH) {
    return ADMIN_HOME_PATH;
  }

  return value;
}
