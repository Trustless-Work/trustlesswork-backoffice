import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockEnv(operatorToken: string | undefined) {
  vi.doMock("@/lib/env", () => ({
    serverEnv: {
      api: {
        identityApiUrl: "https://identity.example.com",
        identityOperatorToken: operatorToken,
      },
    },
  }));
}

function mockSession(token: string | undefined) {
  vi.doMock("@/lib/session", () => ({
    getSessionToken: vi.fn().mockResolvedValue(token),
  }));
}

describe("identity fetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("presents the operator token on operator calls", async () => {
    mockEnv("operator-token");
    mockSession("user-token");

    const { identityOperatorFetch } = await import("@/lib/identity-fetch");
    await identityOperatorFetch("/auth/session/challenge", { method: "POST" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://identity.example.com/auth/session/challenge");
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer operator-token",
    );
  });

  it("answers 503 without calling identity when the operator token is missing", async () => {
    mockEnv(undefined);
    mockSession(undefined);

    const { identityOperatorFetch } = await import("@/lib/identity-fetch");
    const response = await identityOperatorFetch("/auth/session/challenge");

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("presents the user's token on session calls", async () => {
    mockEnv("operator-token");
    mockSession("user-token");

    const { identitySessionFetch } = await import("@/lib/identity-fetch");
    await identitySessionFetch("/users/me");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer user-token",
    );
  });

  it("answers 401 without calling identity when there is no session", async () => {
    mockEnv("operator-token");
    mockSession(undefined);

    const { identitySessionFetch } = await import("@/lib/identity-fetch");
    const response = await identitySessionFetch("/users/me");

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
