import { Suspense } from "react";
import type { Metadata } from "next";
import { serverEnv } from "@/lib/env";
import { Spinner } from "@/components/ui/spinner";
import { AdminLoginView } from "@/features/admin-auth/ui/AdminLoginView";

export const metadata: Metadata = {
  title: "Admin",
};

/**
 * Rendered per request so `ADMIN_ALLOWED_EMAIL_DOMAIN` is read at runtime.
 * Prerendering this page would bake the domain in at build time — the exact
 * redeploy-to-change problem that keeping it out of `NEXT_PUBLIC_*` avoids.
 */
export const dynamic = "force-dynamic";

/**
 * The only public route under /admin.
 *
 * A Server Component so it can read the server-only allowed email domain and
 * pass it to the client view — that keeps a single source of truth for the
 * allowlist instead of a NEXT_PUBLIC twin that could drift.
 *
 * Suspense is required because the view reads `useSearchParams()`.
 */
export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <AdminLoginView
        allowedEmailDomain={serverEnv.adminAuth.allowedEmailDomain}
      />
    </Suspense>
  );
}
