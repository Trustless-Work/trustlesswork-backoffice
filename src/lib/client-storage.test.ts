import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SOUND_EFFECTS_STORAGE_KEY,
  getStoredNetwork,
  getStoredSoundEffectsEnabled,
  setStoredNetwork,
  setStoredSoundEffectsEnabled,
} from "@/lib/client-storage";

describe("client preferences", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
        key: () => null,
        length: 0,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to enabled when nothing is stored", () => {
    expect(getStoredSoundEffectsEnabled()).toBe(true);
  });

  it("stores the selected network", () => {
    expect(getStoredNetwork()).toBe("testnet");

    setStoredNetwork("mainnet");
    expect(getStoredNetwork()).toBe("mainnet");
  });

  it("persists disabled and enabled values", () => {
    setStoredSoundEffectsEnabled(false);
    expect(getStoredSoundEffectsEnabled()).toBe(false);
    expect(store.get(SOUND_EFFECTS_STORAGE_KEY)).toBe("false");

    setStoredSoundEffectsEnabled(true);
    expect(getStoredSoundEffectsEnabled()).toBe(true);
    expect(store.get(SOUND_EFFECTS_STORAGE_KEY)).toBe("true");
  });
});
