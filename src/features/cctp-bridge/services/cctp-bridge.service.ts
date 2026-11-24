import http from "@/lib/http";
import type {
  AttestationResponse,
  ClearCrossChainDestinationInput,
  CctpDestinationDomain,
  CrossChainDestination,
  FeeQuote,
  GetCrossChainDestinationInput,
  SendTransactionResponse,
  SetCrossChainDestinationInput,
  SetCrossChainDestinationResponse,
  UnsignedTransactionResponse,
} from "@/features/cctp-bridge/types/cctp-bridge.types";

function escrowBasePath(escrowKind: "single-release" | "multi-release") {
  return `/core/escrow/${escrowKind}/v2`;
}

export class CctpBridgeService {
  /** Builds the unsigned tx for the receiver to register their cross-chain payout target. */
  async buildSetCrossChainDestination(
    input: SetCrossChainDestinationInput,
  ): Promise<SetCrossChainDestinationResponse> {
    const { escrowKind, ...body } = input;
    const { data } = await http.post<SetCrossChainDestinationResponse>(
      `${escrowBasePath(escrowKind)}/cross-chain-destination`,
      body,
    );
    return data;
  }

  /** Live fee estimate for a destination — a snapshot, not a locked price. */
  async getFeeQuote(destinationDomain: CctpDestinationDomain): Promise<FeeQuote> {
    const { data } = await http.get<FeeQuote>(
      `/core/cctp/fee-quote/${destinationDomain}`,
    );
    return data;
  }

  /** Builds the unsigned tx for the receiver to clear their cross-chain payout target. */
  async buildClearCrossChainDestination(
    input: ClearCrossChainDestinationInput,
  ): Promise<UnsignedTransactionResponse> {
    const { escrowKind, ...body } = input;
    const { data } = await http.post<UnsignedTransactionResponse>(
      `${escrowBasePath(escrowKind)}/cross-chain-destination/clear`,
      body,
    );
    return data;
  }

  /** Reads the receiver's registered cross-chain destination, or null if none. */
  async getCrossChainDestination(
    input: GetCrossChainDestinationInput,
  ): Promise<CrossChainDestination | null> {
    const path =
      input.escrowKind === "multi-release"
        ? `${escrowBasePath(input.escrowKind)}/cross-chain-destination/${input.contractId}/${input.milestoneIndex}`
        : `${escrowBasePath(input.escrowKind)}/cross-chain-destination/${input.contractId}`;
    const { data } = await http.get<CrossChainDestination | null>(path);
    return data;
  }

  /** Submits a client-signed XDR (e.g. from a set/clear destination call) to the network. */
  async sendTransaction(signedXdr: string): Promise<SendTransactionResponse> {
    const { data } = await http.post<SendTransactionResponse>(
      "/core/stellar/send-transaction",
      { signedXdr },
    );
    return data;
  }

  /** Fetches Circle's CCTP attestation for a Stellar burn (release) tx hash. */
  async getAttestation(burnTxHash: string): Promise<AttestationResponse> {
    const { data } = await http.get<AttestationResponse>(
      `/core/cctp/attestation/${burnTxHash}`,
    );
    return data;
  }
}

export const cctpBridgeService = new CctpBridgeService();
