# Multi-Release Escrow

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on mainnet. The V2 Core API is documented separately in [skills/api/v2/](v2/); the V2 React SDK is documented in [skills/react-sdk/v2/](../../skills/react-sdk/v2/react-sdk.md); the V2 Blocks surface is **not** documented yet. For the contract-level differences see [constitution.md](../../constitution.md).

Multi-release escrows release funds incrementally as each milestone is completed and approved.

## When to Use

- Milestone-based payments
- Progressive payment structure
- Projects requiring partial payments
- Long-term projects with multiple deliverables

## API Headers

All endpoints require these headers:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `x-api-key` | `<your_api_key>` |

**Note:** Use `x-api-key` header (not `Authorization: Bearer`).

## Deploy Escrow

**Endpoint:** `POST /deployer/multi-release`

### Request Schema

```typescript
interface MultiReleaseContract {
  signer: string;                    // Entity that signs the transaction that deploys and initializes the escrow
  engagementId: string;              // Unique identifier for the escrow
  title: string;                     // Name of the escrow
  description: string;               // Text describing the function of the escrow
  roles: {
    approver: string;                // Address of the entity requiring the service
    serviceProvider: string;          // Address of the entity providing the service
    platformAddress: string;          // Address of the entity that owns the escrow
    releaseSigner: string;           // Address of the user in charge of releasing the escrow funds to the service provider
    disputeResolver: string;         // Address in charge of resolving disputes within the escrow
    // Note: No receiver in roles - each milestone has its own receiver
  };
  platformFee: number;              // Commission that the platform will receive when the escrow is completed
  milestones: {
    description: string;             // Text describing the function of the milestone
    amount: number;                   // Amount to be transferred upon completion of this milestone
    receiver: string;                 // Address where milestone proceeds will be sent to
    // Note: Do NOT include "approvedFlag" or "status" when deploying
  }[];
  trustline: {
    address: string;                 // Public address establishing permission to accept and use a specific token
    symbol: string;                   // Official abbreviation representing the token (e.g., "USDC", "EURC")
  };
}
```

**Note:** Multi-release does NOT have a single `amount` field. Each milestone has its own `amount` and `receiver`.

### Required Fields

- `signer` (required)
- `engagementId` (required)
- `title` (required)
- `description` (required)
- `roles` (required) - without receiver
- `platformFee` (required)
- `milestones` (required) - each with `description`, `amount`, and `receiver`
- `trustline` (required)

### Constraints

- Escrow must have at least one milestone
- Cannot define more than 50 milestones in an escrow
- Platform fee cannot exceed 99%
- Amount cannot be zero (per milestone)
- All flags (approved, disputed, released) must be false when deploying

### Example Request

```json
{
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "engagementId": "project-456",
  "title": "Mobile App Development",
  "description": "Build iOS and Android apps with 4 milestones",
  "roles": {
    "approver": "GGHI7890123456789012345678901234567890123",
    "serviceProvider": "GDEF4567890123456789012345678901234567890",
    "platformAddress": "GPLT1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "releaseSigner": "GGHI7890123456789012345678901234567890123",
    "disputeResolver": "GJKL0123456789012345678901234567890123456"
  },
  "platformFee": 200,
  "milestones": [
    {
      "description": "UI/UX Design",
      "amount": 2000,
      "receiver": "GDEF4567890123456789012345678901234567890"
    },
    {
      "description": "iOS Development",
      "amount": 3000,
      "receiver": "GDEF4567890123456789012345678901234567890"
    },
    {
      "description": "Android Development",
      "amount": 3000,
      "receiver": "GDEF4567890123456789012345678901234567890"
    },
    {
      "description": "Testing and Launch",
      "amount": 2000,
      "receiver": "GDEF4567890123456789012345678901234567890"
    }
  ],
  "trustline": {
    "address": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    "symbol": "USDC"
  }
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow already initialized
- `400`: The platform fee cannot exceed 99%
- `400`: Escrow initialized without milestone
- `400`: Cannot define more than 50 milestones in an escrow
- `400`: Amount cannot be zero
- `400`: All flags (approved, disputed, released) must be false in order to execute this function
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const deployMultiReleaseEscrow = async () => {
  const { address } = await kit.getAddress();

  const response = await http.post("/deployer/multi-release", {
    signer: address,
    engagementId: "project-456",
    title: "Mobile App Development",
    description: "Build iOS and Android apps",
    roles: {
      approver: approverAddress,
      serviceProvider: serviceProviderAddress,
      platformAddress: platformAddress,
      releaseSigner: releaseSignerAddress,
      disputeResolver: disputeResolverAddress,
    },
    platformFee: 200,
    milestones: [
      {
        description: "UI/UX Design",
        amount: 2000,
        receiver: serviceProviderAddress,
      },
      {
        description: "iOS Development",
        amount: 3000,
        receiver: serviceProviderAddress,
      },
      {
        description: "Android Development",
        amount: 3000,
        receiver: serviceProviderAddress,
      },
      {
        description: "Testing and Launch",
        amount: 2000,
        receiver: serviceProviderAddress,
      },
    ],
    trustline: {
      address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", // testnet USDC issuer
      symbol: "USDC",
    },
  });

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Fund Escrow

**Endpoint:** `POST /escrow/multi-release/fund-escrow`

Deposit funds into an existing escrow contract. Amount should equal the sum of all milestone amounts. Fees (platform fee and the 0.3% protocol fee on mainnet) are calculated from the escrow amount and deducted at release — they are not an extra amount to fund.

### Request Schema

```typescript
interface FundEscrow {
  contractId: string;  // ID (address) that identifies the escrow contract
  signer: string;      // Entity that signs the transaction
  amount: number;      // Amount to transfer to the escrow contract (sum of all milestone amounts)
}
```

### Required Fields

- `contractId` (required)
- `signer` (required)
- `amount` (required)

### Constraints

- Amount cannot be equal to or less than zero
- Amount should equal: sum of all milestone amounts (fees are deducted at release, not funded upfront)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "amount": 10000
}
```

**Note:** For milestones totaling 10000 (2000 + 3000 + 3000 + 2000)

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Amount cannot be equal to or less than zero
- `400`: The provided escrow properties do not match the stored escrow
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const fundEscrow = async (contractId: string, totalAmount: number) => {
  const { address } = await kit.getAddress();

  const response = await http.post("/escrow/multi-release/fund-escrow", {
    contractId,
    signer: address,
    amount: totalAmount, // Sum of all milestone amounts
  });

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Complete Milestone

**Endpoint:** `POST /escrow/multi-release/complete-milestone`

Service Provider marks a milestone as complete.

### Request Schema

```typescript
interface CompleteMilestone {
  contractId: string;      // ID (address) that identifies the escrow contract
  signer: string;          // Service Provider address
  milestoneIndex: string;   // Index of milestone (0-based, as string: "0", "1", ...)
}
```

### Required Fields

- `contractId` (required)
- `signer` (required)
- `milestoneIndex` (required) - as string

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "signer": "GDEF4567890123456789012345678901234567890",
  "milestoneIndex": "0"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the service provider can complete milestones
- `400`: Escrow initialized without milestones
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

## Approve Milestone

**Endpoint:** `POST /escrow/multi-release/approve-milestone`

Approver approves a milestone. Funds are released immediately upon approval.

### Request Schema

```typescript
interface ApproveMilestone {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;  // Position that identifies the milestone within the group of milestones in the escrow (as string)
  approver: string;        // Address of the entity requiring the service
}
```

**Note:** `milestoneIndex` is a string in multi-release endpoints.

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required) - as string
- `approver` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "approver": "GGHI7890123456789012345678901234567890123"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the approver can change milestone flag
- `400`: You cannot approve a milestone that has already been approved previously
- `400`: The milestone status cannot be empty
- `400`: Escrow initialized without milestone
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const approveMilestone = async (
  contractId: string,
  milestoneIndex: string
) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/multi-release/approve-milestone",
    {
      contractId,
      milestoneIndex, // String, not number
      approver: address,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Change Milestone Status

**Endpoint:** `POST /escrow/multi-release/change-milestone-status`

Service Provider updates the status and evidence of a milestone.

### Request Schema

```typescript
interface ChangeMilestoneStatus {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;  // Position that identifies the milestone within the group of milestones in the escrow
  newStatus: string;       // New value for the status property within the escrow milestone
  newEvidence: string;     // New value for the evidence property within the escrow milestone
  serviceProvider: string;  // Address of the entity providing the service
}
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required) - as string
- `newStatus` (required)
- `newEvidence` (required)
- `serviceProvider` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "newStatus": "In Progress",
  "newEvidence": "https://example.com/proof-of-work.pdf",
  "serviceProvider": "GDEF4567890123456789012345678901234567890"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the service provider can change milestone status
- `400`: Invalid milestone index
- `400`: Escrow initialized without milestone
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

## Release Milestone Funds

**Endpoint:** `POST /escrow/multi-release/release-milestone-funds`

Releases funds for a specific approved milestone. Called by the Release Signer after a milestone is approved.

### Request Schema

```typescript
interface ReleaseMilestoneFunds {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;  // Index of the milestone to be released
  releaseSigner: string;   // Address of the user in charge of releasing the escrow funds to the service provider
}
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required) - as string
- `releaseSigner` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "releaseSigner": "GGHI7890123456789012345678901234567890123"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the release signer can release milestone funds
- `400`: Milestone not approved
- `400`: Milestone already released
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

## Dispute Escrow

**Endpoint:** `POST /escrow/multi-release/dispute-escrow`

Any party can initiate a dispute for a specific milestone.

### Request Schema

```typescript
interface DisputeEscrow {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;  // Index of the milestone to be disputed
  signer: string;          // Entity that signs the transaction that deploys and initializes the escrow
}
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required) - as string
- `signer` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Escrow already in dispute
- `400`: You are not authorized to change the dispute flag
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

## Resolve Dispute

**Endpoint:** `POST /escrow/multi-release/resolve-dispute`

Dispute Resolver decides how to distribute funds for a disputed milestone.

### Request Schema

```typescript
interface ResolveDispute {
  contractId: string;        // ID (address) that identifies the escrow contract
  milestoneIndex: string;    // Index of the milestone to be resolved
  disputeResolver: string;   // Address of the user defined to resolve disputes in an escrow
  distributions: { address: string; amount: number }[];  // Distributions detailing address and amount to allocate. Must be positive and must not exceed the milestone amount (they do not have to equal the full balance).
}
```

### Distributions Format

Distributions is an array of `{ address, amount }` objects (amounts are numbers):

```typescript
distributions: [
  { address: "GDEF4567890123456789012345678901234567890", amount: 1900 }, // Service provider gets most
  { address: "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", amount: 100 }   // Payer gets refund
]
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required) - as string
- `disputeResolver` (required)
- `distributions` (required)

### Constraints

- None of the amounts to be transferred should be less or equal than 0
- The total of distributions must not exceed the milestone amount (it does not have to equal the full balance)
- The total amount to be distributed cannot be equal to zero

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "disputeResolver": "GJKL0123456789012345678901234567890123456",
  "distributions": [
    { "address": "GDEF4567890123456789012345678901234567890", "amount": 1900 },
    { "address": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", "amount": 100 }
  ]
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Only the dispute resolver can execute this function
- `400`: None of the amounts to be transferred should be less or equal than 0
- `400`: Escrow not in dispute
- `400`: Insufficient funds for resolution
- `400`: Total dispute funds must not exceed the milestone amount
- `400`: The total amount to be distributed cannot be equal to zero
- `400`: Escrow not found
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

## Update Escrow

**Endpoint:** `PUT /escrow/multi-release/update-escrow`

Update escrow properties. **Only the platform address can execute this endpoint.**

### Requirements

1. Only the entity with the platform role has permissions to execute this endpoint
2. If an escrow has funds, the only thing the platform can do is add more milestones. The other properties cannot be modified under any circumstances.

### Request Schema

```typescript
interface UpdateMultiReleaseEscrow {
  signer: string;      // Entity that signs the transaction
  contractId: string;  // ID (address) that identifies the escrow contract
  escrow: {
    engagementId: string;
    title: string;
    description: string;
    roles: {
      approver: string;
      serviceProvider: string;
      platformAddress: string;
      releaseSigner: string;
      disputeResolver: string;
      // Note: No receiver in roles - each milestone has its own receiver
    };
    platformFee: number;
    milestones: {
      description: string;
      amount: number;
      receiver: string;
      status?: string;      // Milestone status. Ex: Approved, In dispute, etc...
      evidence?: string;    // Evidence of work performed by the service provider
      flags?: {
        disputed?: boolean;
        released?: boolean;
        resolved?: boolean;
        approved?: boolean;
      };
    }[];
    flags?: {
      disputed?: boolean;
      released?: boolean;
      resolved?: boolean;
    };
    isActive?: boolean;
    receiverMemo?: number;
    trustline: {
      address: string;
    };
  };
}
```

### Required Fields

- `signer` (required)
- `contractId` (required)
- `escrow` (required)

### Constraints

- Only the platform address should be able to execute this function
- The platform address of the escrow cannot be changed
- Escrow has been opened for dispute resolution (cannot update)
- All flags (approved, disputed, released) must be false in order to execute this function
- The platform fee cannot exceed 99%
- Cannot define more than 50 milestones in an escrow
- If escrow has funds, only milestones can be added

## Withdraw Remaining Funds

**Endpoint:** `POST /escrow/multi-release/withdraw-remaining-funds`

Dispute Resolver can withdraw remaining funds after all milestones are completed or dispute is resolved.

### Request Schema

```typescript
interface WithdrawRemainingFunds {
  contractId: string;        // ID (address) that identifies the escrow contract
  disputeResolver: string;    // Address of the user defined to resolve disputes in an escrow
  distributions: { address: string; amount: number }[];  // Distributions detailing address and amount to allocate when withdrawing remaining funds after all milestones are released or resolved. Total must be positive and must not exceed the remaining contract balance.
}
```

### Distribution Format

Distributions is an array of `{ address, amount }` objects (amounts are numbers):

```typescript
distributions: [
  { address: "GDEF4567890123456789012345678901234567890", amount: 100 },
  { address: "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", amount: 50 }
]
```

### Required Fields

- `contractId` (required)
- `disputeResolver` (required)
- `distributions` (required)

### Constraints

- Only the dispute resolver can execute this function
- All milestones must already be released or dispute-resolved
- The total must be positive and must not exceed the remaining contract balance
- None of the amounts should be less than or equal to zero

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "disputeResolver": "GJKL0123456789012345678901234567890123456",
  "distributions": [
    { "address": "GDEF4567890123456789012345678901234567890", "amount": 100 },
    { "address": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", "amount": 50 }
  ]
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Only the dispute resolver can execute this function
- `400`: Empty distributions array
- `400`: Invalid distribution addresses
- `400`: Distribution amount exceeds remaining funds
- `400`: Distribution total mismatch
- `400`: Escrow not found
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const withdrawRemainingFunds = async (
  contractId: string,
  distributions: [string, string][]
) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/multi-release/withdraw-remaining-funds", // only for multi-release
    {
      contractId,
      disputeResolver: address,
      distributions,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Complete Workflow Example

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

async function multiReleaseWorkflow() {
  const { address } = await kit.getAddress();

  // 1. Deploy escrow
  const deployResponse = await http.post("/deployer/multi-release", {
    signer: address,
    engagementId: "project-456",
    title: "Mobile App Development",
    description: "Build iOS and Android apps",
    roles: {
      approver: approverAddress,
      serviceProvider: serviceProviderAddress,
      platformAddress: platformAddress,
      releaseSigner: releaseSignerAddress,
      disputeResolver: disputeResolverAddress,
    },
    platformFee: 200,
    milestones: [
      {
        description: "UI/UX Design",
        amount: 2000,
        receiver: serviceProviderAddress,
      },
      {
        description: "iOS Development",
        amount: 3000,
        receiver: serviceProviderAddress,
      },
      {
        description: "Android Development",
        amount: 3000,
        receiver: serviceProviderAddress,
      },
      {
        description: "Testing and Launch",
        amount: 2000,
        receiver: serviceProviderAddress,
      },
    ],
    trustline: {
      address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", // testnet USDC issuer
      symbol: "USDC",
    },
  });

  const { unsignedTransaction: deployXdr } = deployResponse.data;
  const { signedTxXdr: signedDeployXdr } = await signTransaction(deployXdr, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const deployTx = await http.post("/helper/send-transaction", {
    signedXdr: signedDeployXdr,
  });

  const contractId = deployTx.data.contractId;

  // 2. Fund escrow (total: 2000 + 3000 + 3000 + 2000 = 10000)
  const fundResponse = await http.post("/escrow/multi-release/fund-escrow", {
    contractId,
    signer: address,
    amount: 10000,
  });

  const { unsignedTransaction: fundXdr } = fundResponse.data;
  const { signedTxXdr: signedFundXdr } = await signTransaction(fundXdr, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  await http.post("/helper/send-transaction", {
    signedXdr: signedFundXdr,
  });

  // 3. Process each milestone individually
  const milestones = [
    { index: 0, amount: 2000 },
    { index: 1, amount: 3000 },
    { index: 2, amount: 3000 },
    { index: 3, amount: 2000 },
  ];

  for (const milestone of milestones) {
    // Complete milestone
    const completeResponse = await http.post(
      "/escrow/multi-release/change-milestone-status",
      {
        contractId,
        milestoneIndex: milestone.index.toString(),
        newStatus: "Completed",
        newEvidence: `https://example.com/milestone-${milestone.index}-proof.pdf`,
        serviceProvider: serviceProviderAddress,
      }
    );

    const { unsignedTransaction: completeXdr } = completeResponse.data;
    const { signedTxXdr: signedCompleteXdr } = await signTransaction(
      completeXdr,
      {
        address: serviceProviderAddress,
        networkPassphrase: WalletNetwork.TESTNET,
      }
    );

    await http.post("/helper/send-transaction", {
      signedXdr: signedCompleteXdr,
    });

    // Approve milestone (funds released immediately)
    const approveResponse = await http.post(
      "/escrow/multi-release/approve-milestone",
      {
        contractId,
        milestoneIndex: milestone.index.toString(),
        approver: approverAddress,
      }
    );

    const { unsignedTransaction: approveXdr } = approveResponse.data;
    const { signedTxXdr: signedApproveXdr } = await signTransaction(
      approveXdr,
      {
        address: approverAddress,
        networkPassphrase: WalletNetwork.TESTNET,
      }
    );

    await http.post("/helper/send-transaction", {
      signedXdr: signedApproveXdr,
    });

    // Funds for this milestone are now released
    console.log(`Milestone ${milestone.index} completed and ${milestone.amount} released`);
  }

  // 4. Withdraw remaining funds (if any) after all milestones
  const withdrawResponse = await http.post(
    "/escrow/multi-release/withdraw-remaining-funds",
    {
      contractId,
      disputeResolver: disputeResolverAddress,
      distributions: [
        [serviceProviderAddress, "100"], // Remaining amount after fees
      ],
    }
  );

  const { unsignedTransaction: withdrawXdr } = withdrawResponse.data;
  const { signedTxXdr: signedWithdrawXdr } = await signTransaction(
    withdrawXdr,
    {
      address: disputeResolverAddress,
      networkPassphrase: WalletNetwork.TESTNET,
    }
  );

  await http.post("/helper/send-transaction", {
    signedXdr: signedWithdrawXdr,
  });
}
```

## Query Escrow Status

```typescript
const response = await http.get(
  `/helper/get-escrow-by-contract-ids?contractIds=${contractId}&validateOnChain=true`,
  {
    headers: {
      "x-api-key": your_api_key,
    },
  }
);

const escrows = await response.data;
// Check escrow.milestones[] for individual milestone status
```

## Key Differences from Single-Release

- **Per-milestone amounts**: Each milestone has its own `amount` field
- **Per-milestone receivers**: Each milestone has its own `receiver` field
- **Incremental releases**: Funds released as each milestone is approved
- **No single amount field**: Total is sum of milestone amounts
- **milestoneIndex as string**: In approve/release endpoints
- **Withdraw remaining funds**: Available after completion
- **Progressive payments**: Service provider gets paid incrementally
- **Milestone-specific disputes**: Disputes are per-milestone, not entire escrow

## Common Patterns

### Using Axios

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com", // or https://api.trustlesswork.com for mainnet
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});
```

### Transaction Flow

```typescript
// 1. Call endpoint
const response = await http.post("/endpoint", payload);

// 2. Get unsigned transaction
const { unsignedTransaction } = response.data;

// 3. Sign transaction
const { signedTxXdr } = await signTransaction(unsignedTransaction, {
  address,
  networkPassphrase: WalletNetwork.TESTNET,
});

// 4. Send transaction
const tx = await http.post("/helper/send-transaction", {
  signedXdr: signedTxXdr,
});

// 5. Handle response
const { data } = tx;
```

### Calculate Total Funding Amount

```typescript
// Fund the sum of milestone amounts. Platform and protocol fees are
// calculated from the escrow amount and deducted at release.
function calculateTotalFunding(milestones: Milestone[]): number {
  return milestones.reduce((sum, m) => sum + m.amount, 0);
}

// Example
const milestones = [
  { amount: 2000, description: "Milestone 1", receiver: "..." },
  { amount: 3000, description: "Milestone 2", receiver: "..." },
];
const totalFunding = calculateTotalFunding(milestones); // 5000
```
