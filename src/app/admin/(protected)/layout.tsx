import { requireAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { AdminShell } from "@/features/admin-auth/ui/AdminShell";

/**
 * Guard for every protected /admin route.
 *
 * This lives in a `(protected)` route group, not at `src/app/admin/layout.tsx`,
 * because a layout there would also wrap `/admin/login` and the guard's redirect
 * would loop forever. Route groups do not affect URLs, so `(protected)/page.tsx`
 * still serves `/admin`.
 *
 * Layouts do not re-run on every nested client navigation, so each protected
 * page and route handler must call `requireAdminSession()` too.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
