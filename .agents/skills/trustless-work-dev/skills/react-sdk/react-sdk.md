# React SDK

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on mainnet. The V2 Core API is documented in [skills/api/v2/](../api/v2/), but the V2 React SDK is documented in [skills/react-sdk/v2/](../../skills/react-sdk/v2/react-sdk.md); the V2 Blocks surface is **not** documented yet. For the contract-level differences see [constitution.md](../../constitution.md).

The Trustless Work React SDK (`@trustless-work/escrow`) provides custom hooks for integrating escrow functionality into React/Next.js applications. It uses Axios for HTTP requests.

> **See [hooks-reference.md](hooks-reference.md) for complete detailed documentation of all hooks with examples.**

## Installation

```bash
npm install "@trustless-work/escrow"
# or
yarn add "@trustless-work/escrow"
# or
pnpm add "@trustless-work/escrow"
```

## Setup

### 1. Create a Provider Component

Create a client component that wraps `TrustlessWorkConfig`:

```tsx
// src/trustless-work-provider.tsx
"use client"; // must be a client component

import React from "react";
import {
  development,  // "https://dev.api.trustlesswork.com" (testnet)
  mainNet,      // "https://api.trustlesswork.com" (mainnet)
  TrustlessWorkConfig,
} from "@trustless-work/escrow";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export function TrustlessWorkProvider({ children }: TrustlessWorkProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

  return (
    <TrustlessWorkConfig baseURL={development} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
```

> Switch `development` to `mainNet` when going to production.

### 2. Wrap Your App

```tsx
// app/layout.tsx (Next.js App Router)
import { TrustlessWorkProvider } from "@/trustless-work-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TrustlessWorkProvider>{children}</TrustlessWorkProvider>
      </body>
    </html>
  );
}
```

### Environment Variables

```env
NEXT_PUBLIC_API_KEY=your_api_key_here
```

> All API calls — including read-only indexer queries — require a valid API key. The deployed API returns `401 Unauthorized` without it.

## Hooks Overview

All write hooks return an **unsigned XDR transaction** that must be:
1. Signed with the wallet that holds the required role
2. Submitted via `useSendTransaction`

### Common 3-Step Pattern

```tsx
import { useSomeHook, useSendTransaction } from '@trustless-work/escrow/hooks';

function MyComponent() {
  const { someFunction } = useSomeHook();
  const { sendTransaction } = useSendTransaction();

  const handleAction = async (payload) => {
    // Step 1: Get unsigned transaction from hook
    const { unsignedTransaction } = await someFunction(payload, "multi-release");

    if (!unsignedTransaction) throw new Error("Missing unsigned transaction");

    // Step 2: Sign with wallet
    const signedXdr = await signTransaction({
      unsignedTransaction,
      address: walletAddress,
    });

    // Step 3: Send transaction
    const data = await sendTransaction(signedXdr);

    if (data.status === "SUCCESS") {
      // handle success
    }
  };
}
```

## Escrow Hooks

### useInitializeEscrow

Deploy and initialize an escrow contract.

```tsx
import { useInitializeEscrow } from '@trustless-work/escrow/hooks';
import {
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload
} from '@trustless-work/escrow/types';

const { deployEscrow } = useInitializeEscrow();

// Single-release
const { unsignedTransaction } = await deployEscrow(payload, "single-release");

// Multi-release
const { unsignedTransaction } = await deployEscrow(payload, "multi-release");
```

**Response after `sendTransaction`** returns `InitializeEscrowResponse` with `contractId` and `escrow`.

### useFundEscrow

Deposit funds into an existing escrow contract.

```tsx
import { useFundEscrow } from '@trustless-work/escrow/hooks';
import { FundEscrowPayload } from '@trustless-work/escrow/types';

const { fundEscrow } = useFundEscrow();

const payload: FundEscrowPayload = {
  contractId: 'CHASVBD...',
  amount: 5000,
  signer: payerAddress
};

const { unsignedTransaction } = await fundEscrow(payload, "single-release");
// or "multi-release" — same payload type for both
```

### useChangeMilestoneStatus

Service provider updates the status and evidence of a milestone.

```tsx
import { useChangeMilestoneStatus } from '@trustless-work/escrow/hooks';
import { ChangeMilestoneStatusPayload } from '@trustless-work/escrow/types';

const { changeMilestoneStatus } = useChangeMilestoneStatus();

const payload: ChangeMilestoneStatusPayload = {
  contractId: 'CHASVBD...',
  milestoneIndex: '0',
  newStatus: 'Completed',
  newEvidence: 'https://example.com/proof.pdf',
  serviceProvider: serviceProviderAddress
};

const { unsignedTransaction } = await changeMilestoneStatus(payload, "multi-release");
```

### useApproveMilestone

Approver approves a milestone.

```tsx
import { useApproveMilestone } from '@trustless-work/escrow/hooks';
import { ApproveMilestonePayload } from '@trustless-work/escrow/types';

const { approveMilestone } = useApproveMilestone();

const payload: ApproveMilestonePayload = {
  contractId: 'CHASVBD...',
  milestoneIndex: '0',
  approver: approverAddress
};

const { unsignedTransaction } = await approveMilestone(payload, "multi-release");
```

### useReleaseFunds

Release Signer releases escrow funds.

```tsx
import { useReleaseFunds } from '@trustless-work/escrow/hooks';
import {
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload
} from '@trustless-work/escrow/types';

const { releaseFunds } = useReleaseFunds();

// Single-release (all funds at once)
const { unsignedTransaction } = await releaseFunds(
  { contractId: 'CHASVBD...', releaseSigner: releaseSignerAddress },
  "single-release"
);

// Multi-release (per milestone)
const { unsignedTransaction } = await releaseFunds(
  { contractId: 'CHASVBD...', milestoneIndex: '0', releaseSigner: releaseSignerAddress },
  "multi-release"
);
```

### useStartDispute

Initiate a dispute.

```tsx
import { useStartDispute } from '@trustless-work/escrow/hooks';

const { startDispute } = useStartDispute();

// Single-release (entire escrow)
const { unsignedTransaction } = await startDispute(
  { contractId: 'CHASVBD...', signer: payerAddress },
  "single-release"
);

// Multi-release (specific milestone)
const { unsignedTransaction } = await startDispute(
  { contractId: 'CHASVBD...', milestoneIndex: '0', signer: payerAddress },
  "multi-release"
);
```

### useResolveDispute

Dispute Resolver distributes funds to resolve a dispute.

```tsx
import { useResolveDispute } from '@trustless-work/escrow/hooks';

const { resolveDispute } = useResolveDispute();

const { unsignedTransaction } = await resolveDispute(
  {
    contractId: 'CHASVBD...',
    disputeResolver: disputeResolverAddress,
    distributions: [
      { address: serviceProviderAddress, amount: 4000 },
      { address: payerAddress, amount: 900 }
    ]
  },
  "single-release"
);
```

### useUpdateEscrow

Update escrow properties (platform address only, before funding or to add milestones).

```tsx
import { useUpdateEscrow } from '@trustless-work/escrow/hooks';

const { updateEscrow } = useUpdateEscrow();

const { unsignedTransaction } = await updateEscrow(payload, "single-release");
```

### useWithdrawRemainingFunds

Withdraw remaining funds from a multi-release escrow after completion or resolution.

```tsx
import { useWithdrawRemainingFunds } from '@trustless-work/escrow/hooks';

const { withdrawRemainingFunds } = useWithdrawRemainingFunds();

// Only for multi-release escrows
const { unsignedTransaction } = await withdrawRemainingFunds(payload);
```

### useSendTransaction

Submit a signed transaction to the network. **Required after every write hook.**

```tsx
import { useSendTransaction } from '@trustless-work/escrow/hooks';

const { sendTransaction } = useSendTransaction();

// signedXdr is a string from wallet.signTransaction()
const data = await sendTransaction(signedXdr);
// data.status === "SUCCESS" | "FAILED"
```

**Response types:**
- Standard: `{ status, message }`
- Initialize/Update escrow: `{ status, message, contractId, escrow }`

> Not needed for: `getEscrowBalances`, `getEscrowsByContractId`, `getEscrowsByRole`, `getEscrowsBySigner`

## Type Matching Rule

The `type` parameter must always match the payload type:

- `"single-release"` → Use `SingleRelease*Payload` types
- `"multi-release"` → Use `MultiRelease*Payload` types

## TypeScript Types

```tsx
import type {
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  FundEscrowPayload,
  ApproveMilestonePayload,
  ChangeMilestoneStatusPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  MultiReleaseResolveDisputePayload,
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  WithdrawRemainingFundsPayload,
  SingleReleaseEscrow,
  MultiReleaseEscrow,
  EscrowType,
  SingleReleaseEscrowStatus
} from '@trustless-work/escrow/types';
```

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { useInitializeEscrow, useSendTransaction } from '@trustless-work/escrow/hooks';
import { InitializeSingleReleaseEscrowPayload } from '@trustless-work/escrow/types';

export function CreateEscrowForm() {
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();
  const [contractId, setContractId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: InitializeSingleReleaseEscrowPayload = {
      signer: walletAddress,
      engagementId: 'project-123',
      title: 'Website Development',
      description: 'Build responsive website',
      roles: {
        approver: approverAddress,
        serviceProvider: serviceProviderAddress,
        platformAddress: platformAddress,
        releaseSigner: releaseSignerAddress,
        disputeResolver: disputeResolverAddress,
        receiver: receiverAddress,
      },
      amount: 5000,
      platformFee: 100,
      milestones: [
        { description: 'Design mockups' },
        { description: 'Frontend development' },
      ],
      trustline: {
        address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // testnet USDC
        symbol: 'USDC',
      },
    };

    // Step 1: Get unsigned transaction
    const { unsignedTransaction } = await deployEscrow(payload, "single-release");

    // Step 2: Sign with wallet
    const signedXdr = await signTransaction({ unsignedTransaction, address: walletAddress });

    // Step 3: Send transaction
    const data = await sendTransaction(signedXdr);

    if (data.status === "SUCCESS") {
      setContractId(data.contractId);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Create Escrow</button>
      {contractId && <p>Escrow created: {contractId}</p>}
    </form>
  );
}
```

## Resources

- [React SDK Documentation](https://docs.trustlesswork.com/trustless-work/escrow-react-sdk/getting-started)
- [TypeScript Types Documentation](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types)
- [API Reference](https://docs.trustlesswork.com/trustless-work/api-rest/introduction)
