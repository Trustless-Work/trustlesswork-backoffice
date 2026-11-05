import { coreFetch } from "@/lib/core-fetch";
import { serverEnv } from "@/lib/env";
import type { NetworkType } from "@/types/network.entity";

const NETWORKS: readonly NetworkType[] = ["testnet", "mainnet"];
const MIRROR_RETRIES = 2;
const MIRROR_RETRY_DELAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createPlatform(
  name: string,
  token: string,
  network: NetworkType,
): Promise<boolean> {
  for (let attempt = 0; ; attempt++) {
    const response = await coreFetch(
      "/platforms",
      { method: "POST", body: JSON.stringify({ name }), network },
      token,
    );

    // A core rejects a new account until its user mirror catches up.
    if (response.status === 401 && attempt < MIRROR_RETRIES) {
      await wait(MIRROR_RETRY_DELAY_MS);
      continue;
    }

    if (!response.ok) {
      console.error(
        `Could not create the platform on ${network}: HTTP ${response.status}`,
      );
    }
    return response.ok;
  }
}

export async function provisionPlatforms(
  name: string,
  token: string,
): Promise<Partial<Record<NetworkType, boolean>>> {
  const networks = NETWORKS.filter((network) =>
    Boolean(serverEnv.api.coreApiUrlFor(network)),
  );

  const entries = await Promise.all(
    networks.map(async (network) => {
      const created = await createPlatform(name, token, network).catch(
        () => false,
      );
      return [network, created] as const;
    }),
  );

  return Object.fromEntries(entries);
}
