import { getClientStorage } from "@/lib/client-storage";

export const ONBOARDING_PENDING_KEY = "onboardingPending";

export function getOnboardingCompletedKey(userId: string): string {
  return `onboardingCompleted:${userId}`;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function markOnboardingPending(): void {
  getSessionStorage()?.setItem(ONBOARDING_PENDING_KEY, "true");
}

export function isOnboardingPending(): boolean {
  return getSessionStorage()?.getItem(ONBOARDING_PENDING_KEY) === "true";
}

export function clearOnboardingPending(): void {
  getSessionStorage()?.removeItem(ONBOARDING_PENDING_KEY);
}

export function markOnboardingCompleted(userId: string): void {
  getClientStorage().setItem(getOnboardingCompletedKey(userId), "true");
}

export function isOnboardingCompleted(userId: string): boolean {
  return (
    getClientStorage().getItem(getOnboardingCompletedKey(userId)) === "true"
  );
}

export function clearOnboardingCompleted(userId: string): void {
  getClientStorage().removeItem(getOnboardingCompletedKey(userId));
}
