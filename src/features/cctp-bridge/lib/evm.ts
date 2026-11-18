import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  numberToHex,
  type Hex,
} from "viem";
import type { CctpDestinationChain } from "./chains";

const RECEIVE_MESSAGE_ABI = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

function getInjectedProvider(): EthereumProvider {
  const provider = (globalThis as { ethereum?: EthereumProvider }).ethereum;
  if (!provider) {
    throw new Error(
      "No EVM wallet found. Install MetaMask (or another EVM wallet) to receive on the destination chain.",
    );
  }
  return provider;
}

/** Ensures the injected wallet is connected and on the right chain, adding it if unknown. */
async function ensureChain(
  provider: EthereumProvider,
  chain: CctpDestinationChain,
): Promise<`0x${string}`> {
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  const account = accounts?.[0] as `0x${string}` | undefined;
  if (!account) {
    throw new Error("No EVM account authorized.");
  }

  const hexChainId = numberToHex(chain.chainId);
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (err) {
    // 4902 = chain not added to the wallet yet.
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      const rpcUrl = chain.viemChain.rpcUrls.default.http[0];
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: chain.viemChain.name,
            nativeCurrency: chain.viemChain.nativeCurrency,
            rpcUrls: [rpcUrl],
            blockExplorerUrls: chain.viemChain.blockExplorers?.default?.url
              ? [chain.viemChain.blockExplorers.default.url]
              : [],
          },
        ],
      });
    } else {
      throw err;
    }
  }

  return account;
}

/** Completes the CCTP transfer via `MessageTransmitterV2.receiveMessage`; receiver signs and pays gas. Returns the dest tx hash. */
export async function completeMintOnEvm(args: {
  chain: CctpDestinationChain;
  message: Hex;
  attestation: Hex;
}): Promise<Hex> {
  const { chain, message, attestation } = args;
  const provider = getInjectedProvider();
  const account = await ensureChain(provider, chain);

  const walletClient = createWalletClient({
    account,
    chain: chain.viemChain,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: chain.viemChain,
    transport: http(),
  });

  const hash = await walletClient.writeContract({
    address: chain.messageTransmitter,
    abi: RECEIVE_MESSAGE_ABI,
    functionName: "receiveMessage",
    args: [message, attestation],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
