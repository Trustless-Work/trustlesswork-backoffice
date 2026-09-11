# Core Concepts

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on mainnet. The V2 Core API is documented separately in [skills/api/v2/](v2/); the V2 React SDK is documented in [skills/react-sdk/v2/](../../skills/react-sdk/v2/react-sdk.md); the V2 Blocks surface is **not** documented yet. For the contract-level differences see [constitution.md](../../constitution.md).

## Overview

Trustless Work is **Escrow-as-a-Service (EaaS)** for stablecoin escrow. It enables trust-minimized conditional payments on Stellar blockchain using Soroban smart contracts. Build **non-custodial** flows with milestones, approvals, and disputes. Ideal for freelancing, marketplaces, grant disbursements, and any milestone-based payment flow.

## Escrow Lifecycle

### Single-Release Escrow Flow

1. **Deploy**: Initialize escrow with roles, milestones, and configuration
2. **Fund**: Lock the escrow amount in the escrow account (fees are deducted at release, not funded upfront)
3. **Update Milestone Status**: Service provider marks milestone(s) as complete, adds evidence
4. **Approve**: Approver verifies and approves milestone(s)
5. **Release**: Release Signer releases all funds at once to Receiver
6. **Dispute** (optional): any dispute-capable role assignment except the Dispute Resolver can raise a dispute (Approver, Service Provider, Platform, Release Signer, or Receiver)
7. **Resolve**: Dispute Resolver decides how to distribute funds

### Multi-Release Escrow Flow

1. **Deploy**: Initialize escrow with roles and milestones (each with its own amount and receiver)
2. **Fund**: Lock the total funds (sum of all milestone amounts; fees are deducted at release)
3. **Update Milestone Status**: Service provider marks a milestone as complete
4. **Approve**: Approver verifies and approves milestone
5. **Release Milestone**: Release Signer releases funds for that specific milestone
6. **Repeat**: Steps 3-5 for each milestone
7. **Withdraw Remaining**: Historically documented for Multi Release; see `constitution.md` and contract issue #117 for the current validation note on Single vs Multi support

## Key Roles

### Core Roles

| Role | Responsibility / authority granted by this assignment |
|------|---------------|
| **Service Provider** | Delivers work, updates milestone status, adds evidence, can raise disputes |
| **Approver** | Validates completion, approves milestones, can raise disputes |
| **Release Signer** | Executes fund releases after approvals, can raise disputes |
| **Receiver** | Final recipient of released funds; can raise disputes |
| **Dispute Resolver** | Resolves disputes by distributing funds; the address assigned to this role cannot raise a dispute |
| **Platform Address** | Receives platform fees; can update escrow subject to lifecycle restrictions; can raise disputes |

### Role Capability Matrix

The matrix describes what each role assignment authorizes **by itself**. If one address holds multiple roles, its effective authority is the combination of those assignments, except where the contract explicitly prohibits an action for that address (notably `disputeResolver` raising a dispute).

| Role assignment | Update milestone status | Approve | Raise dispute | Resolve | Release | Receive payout | Receive fee |
|------|-------------|---------|--------------|---------|---------|---------------|------------|
| Service Provider | Yes | No | Yes | No | No | Only if also a receiver | No |
| Approver | No | Yes | Yes | No | No | Only if also a receiver | No |
| Release Signer | No | No | Yes | No | Yes | Only if also a receiver | No |
| Receiver | No | No | Yes | No | No | Yes | No |
| Dispute Resolver | No | No | **No — explicitly prohibited** | Yes | No | Only if also a distribution recipient | No |
| Platform Address | No | No | Yes | No | No | Only if also a receiver/distribution recipient | Yes |

### Important Distinctions

- **Status update** = communicates progress (authorized by the Service Provider role assignment)
- **Approval** = validates completion (authorized by the Approver role assignment)
- **Release** = executes payment movement (authorized by the Release Signer role assignment)
- **Role co-location is supported by design**: the same address may hold multiple roles, including Service Provider + Approver. Use distinct addresses when the product requires separation of duties or independent checks; V1 does not require role separation.
- **`engagementId` is an external reference**: use it to associate an escrow with your own contract, sale, invoice, order, grant, or serial number. V1 does not enforce global uniqueness.

## Escrow Flags

Status tracked via boolean flags:

- **approved**: Milestone(s) approved for release
- **disputed**: Escrow is in dispute
- **released**: Funds have been released
- **resolved**: Dispute has been resolved

## API Authentication

All API requests require an API key header:

```
x-api-key: YOUR_API_KEY
```

### Getting an API Key

1. Connect wallet to https://dapp.trustlesswork.com
2. Click wallet address (bottom left)
3. Go to Settings → API Keys tab
4. Complete profile (name, email, use case — **required**)
5. Choose network (Testnet or Mainnet) and generate API key
6. **Copy immediately** — it cannot be viewed again after closing the dialog

## Base URLs

```
Mainnet:  https://api.trustlesswork.com
Testnet:  https://dev.api.trustlesswork.com
```

**Swagger UI:**
- Mainnet: `https://api.trustlesswork.com/docs`
- Testnet: `https://dev.api.trustlesswork.com/docs`

## Rate Limits

**50 requests per 60 seconds** per client.

## Fees

Mainnet deducts a **0.3% protocol fee** at release alongside the configured platform fee; neither fee is an extra amount that must be funded upfront.

## Common Error Types

```typescript
enum ApiErrorTypes {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  WALLET_ERROR = "WALLET_ERROR",
}
```

## HTTP Status Codes

- **200/201**: Success
- **400**: Bad request (missing/invalid parameters)
- **401**: Unauthorized (invalid/missing API key)
- **429**: Too many requests (rate limiting)
- **500**: Server error (escrow not found, unexpected errors)

## Transaction Pattern

All escrow write operations follow this pattern:

1. **Call API endpoint** → Returns unsigned XDR transaction
2. **Sign transaction** → Use the signer authorized for that operation to sign the XDR
3. **Submit transaction** → POST to `/helper/send-transaction` with signed XDR
4. **Verify on-chain** → Query escrow with `validateOnChain=true`

### Example Transaction Flow

```typescript
// 1. Get unsigned transaction (testnet base URL — use https://api.trustlesswork.com for mainnet)
const response = await fetch('https://dev.api.trustlesswork.com/deployer/single-release', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(deployPayload)
});

const { unsignedTransaction } = await response.json();

// 2. Sign with the address authorized for this operation
const { signedTxXdr } = await signTransaction(unsignedTransaction, {
  address,
  networkPassphrase: WalletNetwork.TESTNET,
});

// 3. Submit transaction
const submitResponse = await fetch('https://dev.api.trustlesswork.com/helper/send-transaction', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ signedXdr: signedTxXdr })
});

// 4. Verify on-chain
const verifyResponse = await fetch(
  `https://dev.api.trustlesswork.com/helper/get-escrows-by-signer?signer=${signerAddress}&validateOnChain=true`,
  { headers: { 'x-api-key': apiKey } }
);
```

## Best Practices

### Security

1. **Never commit API keys** to repos — load them from environment variables and rotate them from the dApp if leaked
2. **Know the key model**: the official V1 SDK pattern uses `NEXT_PUBLIC_API_KEY`, which is browser-visible by design — treat Trustless Work API keys as client-visible application keys. Stellar secret keys (`S...`) are absolute secrets and never leave the user's wallet
3. **Validate on-chain** when displaying escrow data (`validateOnChain=true`)
4. **Verify transaction signatures** before submitting
5. **Handle errors gracefully** with user-friendly messages

### Error Handling

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

async function callTrustlessWorkAPI(endpoint: string, options: RequestInit) {
  try {
    const response = await http.post(endpoint, options);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    switch (status) {
      case 401:
        throw new Error('Invalid API key. Check your API key in settings.');
      case 404:
        throw new Error('Escrow not found');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later.');
      default:
        throw new Error(error.response?.data?.message || `API error: ${status}`);
    }
  }
}
```

### State Management

- Track escrow status locally but always verify with API
- Use `validateOnChain=true` for critical operations
- Poll for status updates during active workflows
- Cache escrow data but refresh before important actions
