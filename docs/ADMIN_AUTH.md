# Backoffice `/admin` authentication

The app runs **two independent auth systems**. They never share cookies, state
or sign-out paths.

| Area         | Mechanism                              | Cookie                         |
| ------------ | -------------------------------------- | ------------------------------ |
| `/dashboard` | Stellar wallet SEP-10 via the core API | `tw_session` (iron-session)    |
| `/admin`     | Supabase email + password + TOTP       | `sb-<project-ref>-auth-token*` |

`/admin` requires **all** of the following, on every request:

1. a valid Supabase session,
2. `aal2` — the TOTP second factor verified for that session,
3. an email whose domain matches `ADMIN_ALLOWED_EMAIL_DOMAIN` exactly,
4. a row in `public.users` with the same email, carrying the `ADMIN` role.

**There is no sign-up.** Nothing in the codebase calls `signUp`; operator
accounts are created directly in the database (see below).

---

## Environment variables

| Variable                               | Where         | Required | Notes                                                                                    |
| -------------------------------------- | ------------- | -------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client schema | yes      | Supabase Dashboard → Project Settings → API → _Project URL_                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client schema | yes      | Same page → the **publishable / anon** key                                               |
| `ADMIN_ALLOWED_EMAIL_DOMAIN`           | server schema | yes      | Bare lowercase domain, e.g. `trustlesswork.com`. No leading `@`, no subdomain wildcards. |

All three are **required**: the app fails to boot without them rather than
silently degrading to an auth gate that can't decide. `.env.example` lists them,
but `.gitignore` contains `.env*`, so that file is untracked — this table is the
tracked source of truth.

**Never add `SUPABASE_SERVICE_ROLE_KEY` to this project.** Admin data access
goes through the publishable key, and every read is scoped by server-side checks;
a service-role key would turn any future RLS policy into a no-op and hand this
app write access to tables the core API owns.

`ADMIN_ALLOWED_EMAIL_DOMAIN` is deliberately **not** `NEXT_PUBLIC_`:
`NEXT_PUBLIC_*` values are inlined at build time, so changing the allowlist
would need a redeploy, and a public twin could drift from what the server
enforces. `/admin/login` is a Server Component (`force-dynamic`) that reads the
value per request and hands it to the client view as a prop, purely so the form
can show a helpful error before hitting the network.

---

## Supabase project setup

1. **Enable TOTP MFA** — Authentication → Multi-Factor Auth → enable TOTP.
   Ensure `MFA_MAX_ENROLLED_FACTORS` is at least 1.
2. **`public.users` is shared with the core API** — treat it as read-only from
   this app. Its `id` is a **bigint**, unrelated to the Supabase Auth uuid, and
   there is no `auth_user_id` column, so the two identities are joined by
   **email**. Authorization is the `roles` array containing `ADMIN`.

   The match is case-insensitive (`ilike`, then an exact re-check in code), so a
   difference in stored casing does not lock an operator out.

3. **Grant an operator access** (no UI does this, on purpose):

   ```sql
   -- 1. Create the auth user in the dashboard (Authentication → Users → Add user)
   --    with the same email as the platform row.
   -- 2. Grant the role on the existing platform row:
   update public.users
      set roles = array_append(roles, 'ADMIN')
    where email = 'operator@trustlesswork.com'
      and not (roles @> array['ADMIN']);
   ```

   The email domain must also match `ADMIN_ALLOWED_EMAIL_DOMAIN`. TOTP is
   enrolled by the operator on their first sign-in — the login page shows a QR
   code and a manual setup key.

   `BACKOFFICE_ADMIN` exists in this column too and does **not** grant access;
   only `ADMIN` does.

---

## How the protection is layered

| Layer                        | File                                                                                | Checks                                                       | Can write cookies                 |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------- |
| Edge middleware              | [`src/middleware.ts`](../src/middleware.ts)                                         | token refresh, `getClaims()`, `aal2`, email domain           | **yes — the only layer that can** |
| RSC guard                    | [`src/app/admin/(protected)/layout.tsx`](<../src/app/admin/(protected)/layout.tsx>) | `getUser()`, `aal2`, domain, `public.users` row with `ADMIN` | no                                |
| Per-page / per-handler guard | `requireAdminSession()`                                                             | same as above                                                | no                                |

Why all three:

- **Middleware alone is not enough.** It is a routing check, its matcher is a
  static list that does not cover route handlers or Server Actions, and it
  deliberately skips the database lookup (that would be a Postgres round-trip on
  every navigation and every prefetch).
- **The layout alone is not enough.** Layouts do not re-run on every nested
  client navigation — moving from `/admin/a` to `/admin/b` does not re-execute
  the parent layout — and they cannot write cookies.
- So **every** protected page, route handler and Server Action must call
  `requireAdminSession()`. It is wrapped in React `cache()`, so repeated calls
  within one render cost a single round-trip.
- **The role check is the authoritative gate**, and only the RSC guard performs
  it. Middleware lets any `aal2` session on the allowed domain through to the
  route; a non-`ADMIN` user is then rejected by the guard and bounced to the
  login page with `?reason=not_an_admin`.
- **There is no RLS backstop on `public.users`** — it is readable with the
  publishable key. That is why the role check must run server-side against an
  email taken from `getUser()` (a network-verified session), never from anything
  in the request. Do not move this check to the client.

### Route layout

```
src/app/admin/
├── login/page.tsx          # PUBLIC  → /admin/login
└── (protected)/
    ├── layout.tsx          # guard
    ├── loading.tsx
    ├── error.tsx
    └── page.tsx            # → /admin
```

There is intentionally **no** `src/app/admin/layout.tsx`: a guard there would
also wrap `/admin/login` and the redirect would loop forever. The `(protected)`
route group avoids that without changing any URL.

`/admin/login` **is** covered by the middleware matcher on purpose — middleware
is the only place a token refresh can be written back.

`/api/admin/**` is **not** matched (`/admin/:path*` is anchored at the root), so
the existing core-API operator proxy keeps its iron-session guard untouched.

---

## Adding a page under `/admin`

1. Put it under `src/app/admin/(protected)/`.
2. Call `await requireAdminSession()` at the top of the page — do not rely on
   the layout alone.
3. Same for any route handler you add: call it before doing anything else.

---

## Sign-out and session expiry

- `POST /api/admin-auth/sign-out` — client-initiated, same-origin checked.
- `GET /api/admin-auth/sign-out?reason=…` — the RSC guard's redirect target,
  because a Server Component cannot clear cookies itself.
- Sign-out uses `scope: "global"` (all devices), which is the right default for a
  backoffice.
- Sign-out shows **no toast** and carries **no** `?reason=`. Only a genuine
  expiry or a guard rejection adds `?reason=`
  (`unauthenticated` | `mfa_required` | `forbidden_domain` | `not_an_admin`).
- Admin sign-out never touches the iron-session or wallet state, and wallet
  logout never touches the `sb-*` cookies.

---

## Gotchas worth knowing

- **`setAll` replaces the middleware response object.** Always go through
  `getResponse()` from
  [`middleware-client.ts`](../src/lib/supabase/middleware-client.ts); capturing
  the response by value silently drops refreshed cookies, which shows up as
  random logouts.
- **`setAll`'s second `headers` argument is mandatory.** It carries
  `Cache-Control: private, no-cache, no-store, …`. Without it a CDN can cache a
  response bearing `Set-Cookie` and serve one operator's session to another.
- **Redirect responses need `applyAuthCookies`.** `NextResponse.redirect()`
  builds a different object.
- **Never trust `getSession()` server-side.** Use `getClaims()` (middleware) or
  `getUser()` (guard).
- **The auth cookie is chunked** (`…auth-token.0`, `.1`, …), so terminating a
  session uses `signOut()` rather than deleting a cookie by name.
- **Abandoned enrollment.** `mfa.enroll` rejects a duplicate friendly name with
  422, and the secret/QR is only ever returned once at enroll time — so a stale
  _unverified_ factor is unusable and is unenrolled before a new enroll.
- **Never log `totp.secret`, `totp.uri` or `totp.qr_code`.** Watch for a stray
  `console.log(step)` while debugging the login state machine.
- **Domain matching is exact.** `endsWith("trustlesswork.com")` would accept
  `nottrustlesswork.com`; `endsWith(".trustlesswork.com")` would accept
  `evil.trustlesswork.com`. See
  [`email-domain.ts`](../src/features/admin-auth/utils/email-domain.ts) and its
  test matrix.
