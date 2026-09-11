# React SDK v2 — `@trustless-work/escrow` 5.x

> **Protocol version: V2 (BETA), testnet only.** SDK 5.x targets the **v2** Core API exclusively — every transaction hook builds `/escrow/{type}/v2/...` routes. For V1 integrations use SDK 3.x and the [V1 React SDK reference](../react-sdk.md).

The REST endpoints and payload shapes this SDK wraps are documented in [skills/api/v2/core-concepts.md](../../api/v2/core-concepts.md). This file covers the React surface: setup, hooks, and the signing loop.

---

## Install

```bash
npm install @trustless-work/escrow@5
```

Peer requirement: a wallet integration that can sign a Stellar XDR — commonly `@creit.tech/stellar-wallets-kit`.

## Provider setup

Wrap your app once. The provider is a client component, so in Next.js App Router it needs `"use client"` in the file that renders it.

```tsx
"use client";

import { TrustlessWorkConfig } from "@trustless-work/escrow";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrustlessWorkConfig
      baseURL="https://beta.api.trustlesswork.com"   // V2 has its own host
      apiKey={process.env.NEXT_PUBLIC_API_KEY}
    >
      {children}
    </TrustlessWorkConfig>
  );
}
```

### Configuration options

| Prop | Type | Purpose |
| --- | --- | --- |
| `baseURL` | `string` | API host. V2 lives on `https://beta.api.trustlesswork.com`, not on the V1 hosts. |
| `apiKey` | `string` | Sent as `x-api-key`. |
| `getAccessToken` | `() => string \| undefined \| null` | Alternative to a static key — called per request, for session-based auth. |
| `defaultHeaders` | `Record<string, string>` | Extra headers on every request. |

`apiKey` and `getAccessToken` can coexist; the getter is re-read on each call, so it suits rotating tokens.

> The package also exports `mainNet` and `development` host constants. Do **not** read them as environments: both point at the beta backend — through its internal hosting URL, not the branded host — and `mainNet` is not production (V2 is not on mainnet). Pass the explicit `baseURL` shown above instead.

> SDK 5.x does **not** require a `QueryClientProvider`. It has no TanStack Query dependency — hooks return plain async functions, so you own the caching strategy.

---

## The signing loop

Every transaction hook **builds** a transaction. It never submits one. The shape is always the same:

```tsx
"use client";

import { useFundEscrow, useSendTransaction } from "@trustless-work/escrow";
import { signTransaction } from "@/lib/wallet";

export function FundButton({ contractId, signer }: Props) {
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();

  async function onFund() {
    // 1. Build — the field is `unsignedXdr`, not `unsignedTransaction`
    const { unsignedXdr } = await fundEscrow(
      { contractId, signer, amount: 1000 },
      "single-release",
    );

    // 2. Sign with the wallet the operation requires
    const signedXdr = await signTransaction(unsignedXdr);

    // 3. Submit
    const result = await sendTransaction(signedXdr);
    // result.code === "STELLAR_TX_SUBMITTED_INDEXER_LAGGING" means it worked
    // but the read model is behind — do not retry the transaction.
  }

  return <button onClick={onFund}>Fund</button>;
}
```

Skipping step 3 means nothing reaches the chain. This is the single most common integration mistake.

### The `type` argument

Most transaction hooks take the escrow type as a second argument:

```ts
type EscrowType = "single-release" | "multi-release";
```

It must match the payload type you pass. A multi-release payload with `"single-release"` hits the wrong route and fails.

A few methods are multi-release only and take no type: `releaseMilestones`, `disputeMilestones` and `approveAndReleaseMilestones`. For the first two the operation does not exist on single-release. Approve-and-release is different: the API **does** expose `POST /escrow/single-release/v2/approve-and-release-milestones` — the SDK just does not wrap it, so for single-release call that route directly.

---

## Transaction hooks

| Hook | Method | Signed by | Notes |
| --- | --- | --- | --- |
| `useDeployEscrow` | `deployEscrow(payload, type, attribution?)` | `signer` | Accepts optional attribution headers |
| `useFundEscrow` | `fundEscrow(payload, type)` | any depositor | |
| `useUpdateEscrow` | `updateEscrow(payload, type)` | `admin` | Only before the first fund (lock is cumulative `FundedAmount`, never resets) |
| `useManageMilestones` | `manageMilestones(payload, type)` | `admin` | Add or edit milestones |
| `useChangeMilestoneStatus` | `changeMilestoneStatus(payload, type)` | a service provider | Batched `updates` |
| `useApproveMilestones` | `approveMilestones(payload, type)` | an approver | One vote per listed milestone |
| `useApproveAndReleaseMilestones` | `approveAndReleaseMilestones(payload)` | approver + release signer | **Multi-release only** in the SDK (see above) |
| `useReleaseFunds` | `releaseFunds(payload, type)` · `releaseMilestones(payload)` | a release signer | The second is multi-release only |
| `useStartDispute` | `startDispute(payload, type)` · `disputeMilestones(payload)` | see below | `disputeMilestones` is multi-release only |
| `useResolveDispute` | `resolveDispute(payload, type)` | a dispute resolver | |
| `useWithdrawRemainingFunds` | `withdrawRemainingFunds(payload, type)` | a dispute resolver | Terminal escrows only |
| `useSendTransaction` | `sendTransaction(signedXdr)` | — | `POST /stellar/send-transaction` |

> **The submit route changed.** V1 documents `POST /helper/send-transaction`. SDK 5.x posts to `/stellar/send-transaction`. Use `useSendTransaction` and you never have to hardcode it.

Dispute permissions follow the contract: approvers, service providers, release signers, the platform and the receiver may open one. A dispute resolver may not — the contract rejects it.

`extend-ttl` has **no hook** — neither SDK wraps it. When you need it, call `POST /escrow/{type}/v2/extend-ttl` directly.

## Read hooks

These query the indexer read model, not the chain directly.

> These hit the **read model** at `/escrows/...`, which is neither version-scoped nor type-scoped — there is no `/v2/` in those paths. The v2 transaction controllers expose their own `GET /escrow/{type}/v2/:contractId`, but the SDK does not use it. Read amounts come back as **decimal strings**.

| Hook | Method | Returns |
| --- | --- | --- |
| `useGetEscrow` | `getEscrow(contractId)` | One escrow |
| `useListEscrows` | `listEscrows(params?)` | Keyset-paginated list |
| `useGetEscrowDetails` | `getEscrowDetails(contractIds)` | Batch detail lookup |
| `useGetEscrowMilestones` | `getEscrowMilestones(contractId)` | Milestones for one escrow |
| `useGetEscrowsMilestones` | `getEscrowsMilestones(contractIds)` | Milestones for many |
| `useGetEscrowsFinancial` | `getEscrowsFinancial(contractIds)` | Financial summary for many |
| `useListEscrowEvents` | `listEscrowEvents(contractId, params?)` | Event history |

Batch hooks accept either a `string[]` of contract IDs or a params object — use the batch form rather than looping single reads.

## GraphQL hooks

New in 5.x. Same read model, one round trip, and you choose the fields.

| Hook | Method | REST twin |
| --- | --- | --- |
| `useGraphqlGetEscrow` | `getEscrow(variables)` | `GET /escrows/:id` |
| `useGraphqlListEscrows` | `listEscrows(variables?)` | `GET /escrows` |

```tsx
const { listEscrows } = useGraphqlListEscrows();
const page = await listEscrows({ scope: "mine", limit: 20, sort: "createdAt", order: "desc" });
```

`listEscrows` filters on `scope` (`"mine"` or `"all"`), `status`, `contractType`, `engagementId`, `contractIds`, `participant`, `role`, `platformId`, `subjectId` and a `createdAfter`/`createdBefore` range. Paginate with `limit` plus `cursor` — it is keyset pagination, not offsets. Sort by `createdAt` or `updatedAt`.

The exported documents `GRAPHQL_GET_ESCROW` and `GRAPHQL_LIST_ESCROWS` are available if you prefer your own client. Errors surface as `GraphqlRequestError`.

Prefer GraphQL when a screen needs several related pieces of one escrow; prefer the REST batch reads when you need the same shape across many escrows.

## Attribution headers

`deployEscrow` accepts an optional third argument that tags the escrow with the platform and end user that created it:

```ts
await deployEscrow(payload, "single-release", {
  platformId: "my-platform",   // X-TW-Platform
  subjectId: "user-123",       // X-TW-Subject
});
```

Useful when one API key serves several platforms or tenants.

---

## Direct service access

The hooks are thin wrappers. Outside React — a server action, a script, a test — use the services directly:

```ts
import { TrustlessWorkClient, EscrowRestService } from "@trustless-work/escrow";
```

`useTrustlessWorkClient`, `useEscrowRest` and `useEscrowGraphql` expose the same objects inside React.

## Common mistakes

* **Forgetting `sendTransaction`.** The hook returns `unsignedXdr`; nothing happens until you sign and submit.
* **Mismatching `type` and payload.** `"single-release"` needs a `SingleRelease*Payload`.
* **Signing with the wrong wallet.** Each operation names its required signer; the contract rejects anything else.
* **Reusing V1 payload shapes.** Roles are arrays in v2, `milestoneIndexes` is `number[]`, and milestone approval is a threshold. See [skills/api/v2/core-concepts.md](../../api/v2/core-concepts.md).
* **Pointing `baseURL` at a V1 host.** V2 is served only from `https://beta.api.trustlesswork.com`; neither `api.trustlesswork.com` nor `dev.api.trustlesswork.com` serves it.
* **Expecting a `QueryClientProvider` requirement.** 5.x does not use TanStack Query; that was the 3.x pattern.
