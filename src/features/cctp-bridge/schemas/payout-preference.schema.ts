import { z } from "zod/v3";
import { isValidWallet } from "@/components/tw-blocks/wallet-kit/validators";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
// Base58, 32-44 chars (Solana pubkey). Excludes 0/O/I/l, so it can't overlap
// an EVM `0x...` (no `0` in base58) or a 56-char Stellar `G...` address.
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const payoutPreferenceSchema = z
  .object({
    destinationDomain: z.coerce.number().int(),
    recipientAddress: z.string().trim().min(1, "Recipient address is required"),
  })
  .superRefine((values, ctx) => {
    // Accept any supported address shape (EVM, Stellar, Solana) without
    // branching on domain — the backend owns the domain↔address pairing.
    const isStellarAddress = isValidWallet(values.recipientAddress);
    const isEvmAddress = EVM_ADDRESS_REGEX.test(values.recipientAddress);
    const isSolanaAddress = SOLANA_ADDRESS_REGEX.test(values.recipientAddress);

    if (!isStellarAddress && !isEvmAddress && !isSolanaAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientAddress"],
        message: "Enter a valid EVM (0x...), Stellar (G...) or Solana address",
      });
    }
  });

export type PayoutPreferenceFormData = z.infer<typeof payoutPreferenceSchema>;
