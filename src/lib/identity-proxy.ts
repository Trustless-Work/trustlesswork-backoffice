const ALLOWED_ROUTES: ReadonlyArray<{ method: string; path: RegExp }> = [
  { method: "GET", path: /^\/users\/me$/ },
  { method: "GET", path: /^\/users\/me\/wallets$/ },
  { method: "DELETE", path: /^\/users\/me\/wallets\/[^/]+$/ },
  { method: "POST", path: /^\/wallets\/link\/challenge$/ },
  { method: "POST", path: /^\/wallets\/link\/verify$/ },
];

export function isAllowedIdentityRoute(method: string, path: string): boolean {
  return ALLOWED_ROUTES.some(
    (route) => route.method === method && route.path.test(path),
  );
}
