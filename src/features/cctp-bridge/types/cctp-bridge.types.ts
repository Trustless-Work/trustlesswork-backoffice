export type EscrowKind = "single-release" | "multi-release";

/** CCTP destination domains the backend accepts for cross-chain destinations. */
export type CctpDestinationDomain = 0 | 1 | 2 | 3 | 5 | 6 | 7;

interface EscrowRef {
  escrowKind: EscrowKind;
  contractId: string;
  /** Required for multi-release escrows — each milestone has its own receiver. */
  milestoneIndex?: number;
}

export interface SetCrossChainDestinationInput extends EscrowRef {
  receiver: string;
  destinationDomain: CctpDestinationDomain;
  recipientAddress: string;
}

export interface ClearCrossChainDestinationInput extends EscrowRef {
  receiver: string;
}

export type GetCrossChainDestinationInput = EscrowRef;

export interface CrossChainDestination {
  destinationDomain: number;
  recipient: string;
}

export interface UnsignedTransactionResponse {
  unsignedXdr: string;
  txHash: string;
}

/** `set_cross_chain_destination`'s response, plus the fee baked into `max_fee`. */
export interface SetCrossChainDestinationResponse
  extends UnsignedTransactionResponse {
  estimatedFeeUsdc: number;
}

/** Live fee preview for a destination — a snapshot, not a locked price. */
export interface FeeQuote {
  destinationDomain: number;
  estimatedFeeUsdc: number;
}

export interface SendTransactionResponse {
  txHash: string;
  ledger: number;
  contractId?: string;
  escrow?: Record<string, unknown>;
  code?: string;
  message?: string;
}

export interface AttestationResponse {
  status: "complete" | "pending";
  message?: string;
  attestation?: string;
}
