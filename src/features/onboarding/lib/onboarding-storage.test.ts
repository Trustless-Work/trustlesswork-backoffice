import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ONBOARDING_PENDING_KEY,
  clearOnboardingCompleted,
  clearOnboardingPending,
  getOnboardingCompletedKey,
  isOnboardingCompleted,
  isOnboardingPending,
  markOnboardingCompleted,
  markOnboardingPending,
} from "@/features/onboarding/lib/onboarding-storage";

describe("onboarding storage", () => {
  const localStore = new Map<string, string>();
  const sessionStore = new Map<string, string>();

  beforeEach(() => {
    localStore.clear();
    sessionStore.clear();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => localStore.get(key) ?? null,
        setItem: (key: string, value: string) => {
          localStore.set(key, value);
        },
        removeItem: (key: string) => {
          localStore.delete(key);
        },
        clear: () => {
          localStore.clear();
        },
        key: () => null,
        length: 0,
      },
      sessionStorage: {
        getItem: (key: string) => sessionStore.get(key) ?? null,
        setItem: (key: string, value: string) => {
          sessionStore.set(key, value);
        },
        removeItem: (key: string) => {
          sessionStore.delete(key);
        },
        clear: () => {
          sessionStore.clear();
        },
        key: () => null,
        length: 0,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks and reads pending state from sessionStorage", () => {
    expect(isOnboardingPending()).toBe(false);

    markOnboardingPending();
    expect(isOnboardingPending()).toBe(true);
    expect(sessionStore.get(ONBOARDING_PENDING_KEY)).toBe("true");

    clearOnboardingPending();
    expect(isOnboardingPending()).toBe(false);
  });

  it("marks and reads completed state per user in localStorage", () => {
    const userId = "user-123";
    const completedKey = getOnboardingCompletedKey(userId);

    expect(isOnboardingCompleted(userId)).toBe(false);

    markOnboardingCompleted(userId);
    expect(isOnboardingCompleted(userId)).toBe(true);
    expect(localStore.get(completedKey)).toBe("true");

    clearOnboardingCompleted(userId);
    expect(isOnboardingCompleted(userId)).toBe(false);
  });
});
