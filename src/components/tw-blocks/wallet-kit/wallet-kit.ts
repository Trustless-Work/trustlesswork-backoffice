import { clientEnv } from "@/lib/env";
import type { ModuleInterface } from "@creit-tech/stellar-wallets-kit/types";
import {
  networkFromPassphrase,
  resolveChallengeNetwork,
  type ChallengeNetwork,
} from "@/features/auth/lib/challenge-network";
import { getStoredNetwork } from "@/lib/client-storage";
import type { NetworkType } from "@/types/network.entity";
import { resolveWalletKitTheme } from "./wallet-kit-theme";

type SdkModule = typeof import("@creit-tech/stellar-wallets-kit/sdk");
type TypesModule = typeof import("@creit-tech/stellar-wallets-kit/types");
type FreighterModuleType =
  typeof import("@creit-tech/stellar-wallets-kit/modules/freighter");
type AlbedoModuleType =
  typeof import("@creit-tech/stellar-wallets-kit/modules/albedo");
type WalletConnectModuleType =
  typeof import("@creit-tech/stellar-wallets-kit/modules/wallet-connect");
type StellarWalletsKitStatic = SdkModule["StellarWalletsKit"];
type NetworksEnum = TypesModule["Networks"];
type WalletConnectModuleInstance =
  InstanceType<WalletConnectModuleType["WalletConnectModule"]>;
type WalletConnectTargetChainEnum =
  WalletConnectModuleType["WalletConnectTargetChain"];

const WALLET_CONNECT_WARMUP_MS = 15_000;
const WALLET_CONNECT_POLL_MS = 100;

function resolveKitNetwork(
  Networks: NetworksEnum,
  network: NetworkType,
): NetworksEnum[keyof NetworksEnum] {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

function resolveWalletConnectChain(
  WalletConnectTargetChain: WalletConnectTargetChainEnum,
  network: NetworkType,
): WalletConnectTargetChainEnum[keyof WalletConnectTargetChainEnum] {
  return network === "mainnet"
    ? WalletConnectTargetChain.PUBLIC
    : WalletConnectTargetChain.TESTNET;
}

async function waitForWalletConnect(
  module: WalletConnectModuleInstance,
): Promise<void> {
  const deadline = Date.now() + WALLET_CONNECT_WARMUP_MS;
  while (Date.now() < deadline) {
    if (await module.isAvailable()) return;
    await new Promise((resolve) => setTimeout(resolve, WALLET_CONNECT_POLL_MS));
  }
}

/**
 * Stellar Wallet Kit helpers
 *
 * We only load and initialize the kit
 * on the client, and only in response to effects or user actions.
 */
let walletKitPromise: Promise<{
  StellarWalletsKit: StellarWalletsKitStatic;
  Networks: NetworksEnum;
  walletConnectModule: WalletConnectModuleInstance | null;
}> | null = null;

export function resetWalletKitLoader(): void {
  walletKitPromise = null;
}

const loadWalletKit = async () => {
  if (typeof window === "undefined") {
    throw new Error("StellarWalletsKit is only available in the browser");
  }

  if (!walletKitPromise) {
    walletKitPromise = (async () => {
      const [sdk, types, freighter, albedo, walletConnect] = await Promise.all([
        import("@creit-tech/stellar-wallets-kit/sdk") as Promise<SdkModule>,
        import("@creit-tech/stellar-wallets-kit/types") as Promise<TypesModule>,
        import(
          "@creit-tech/stellar-wallets-kit/modules/freighter"
        ) as Promise<FreighterModuleType>,
        import(
          "@creit-tech/stellar-wallets-kit/modules/albedo"
        ) as Promise<AlbedoModuleType>,
        import(
          "@creit-tech/stellar-wallets-kit/modules/wallet-connect"
        ) as Promise<WalletConnectModuleType>,
      ]);

      const { StellarWalletsKit } = sdk;
      const { Networks } = types;
      const { WalletConnectModule, WalletConnectTargetChain } = walletConnect;

      const projectId = clientEnv.integrations.walletConnectProjectId;
      const appOrigin = window.location.origin;
      const storedNetwork = getStoredNetwork();
      const kitNetwork = resolveKitNetwork(Networks, storedNetwork);
      const walletConnectChain = resolveWalletConnectChain(
        WalletConnectTargetChain,
        storedNetwork,
      );

      /**
       * We intentionally restrict the connectable wallets to WalletConnect, Freighter
       * and Albedo instead of using `defaultModules()` (which exposes every supported
       * wallet).
       */
      const walletModules: ModuleInterface[] = [
        new freighter.FreighterModule(),
        new albedo.AlbedoModule(),
      ];

      let walletConnectModule: WalletConnectModuleInstance | null = null;

      if (projectId) {
        walletConnectModule = new WalletConnectModule({
          projectId,
          metadata: {
            name: "Trustless Work",
            description:
              "Create escrows on the Stellar blockchain with Trustless Work.",
            icons: [`${appOrigin}/e.png`],
            url: appOrigin,
          },
          allowedChains: [walletConnectChain],
        });
        walletModules.push(walletConnectModule);
      }

      StellarWalletsKit.init({
        network: kitNetwork,
        modules: walletModules,
        theme: resolveWalletKitTheme(),
      });

      return { StellarWalletsKit, Networks, walletConnectModule };
    })();
  }

  return walletKitPromise;
};

interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
  networkPassphrase?: string;
}

/**
 * Open the authentication modal and request the user's address.
 */
export const openAuthModal = async (): Promise<{ address: string }> => {
  const { StellarWalletsKit, walletConnectModule } = await loadWalletKit();
  StellarWalletsKit.setTheme(resolveWalletKitTheme());
  if (walletConnectModule) {
    await waitForWalletConnect(walletConnectModule);
  }
  return StellarWalletsKit.authModal();
};

/**
 * Get the currently selected wallet module.
 */
export const getSelectedWallet = async (): Promise<ModuleInterface> => {
  const { StellarWalletsKit } = await loadWalletKit();
  return StellarWalletsKit.selectedModule;
};

/**
 * Disconnect the current wallet.
 */
export const disconnectWalletKit = async (): Promise<void> => {
  const { StellarWalletsKit } = await loadWalletKit();
  return StellarWalletsKit.disconnect();
};

export const disconnectWalletKitSafe = async (): Promise<void> => {
  try {
    await disconnectWalletKit();
  } catch {
    // Wallet kit may not be initialized or already disconnected.
  }
};

const getWalletPassphrase = async (): Promise<string | undefined> => {
  const { StellarWalletsKit } = await loadWalletKit();

  // Only some wallets can report their network, and one may not be selected.
  try {
    const { networkPassphrase } = await StellarWalletsKit.getNetwork();
    return networkPassphrase;
  } catch {
    return undefined;
  }
};

export const getWalletNetwork = async (): Promise<NetworkType | undefined> =>
  networkFromPassphrase(await getWalletPassphrase());

export const getChallengeNetwork = async (): Promise<ChallengeNetwork> =>
  resolveChallengeNetwork(await getWalletPassphrase(), getStoredNetwork());

/**
 * Helper to sign a transaction XDR with the active wallet.
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
  networkPassphrase,
}: SignTransactionParams): Promise<string> => {
  const { StellarWalletsKit, Networks } = await loadWalletKit();

  const resolvedPassphrase =
    networkPassphrase ?? resolveKitNetwork(Networks, getStoredNetwork());

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    unsignedTransaction,
    {
      address,
      networkPassphrase: resolvedPassphrase,
    },
  );

  return signedTxXdr;
};
