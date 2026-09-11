# JavaScript SDK v2 — `@trustless-work/escrow-js`

> **Protocol version: V2 (BETA).** Framework-agnostic client over Core API v2, served from `https://beta.api.trustlesswork.com`. There is no V1 equivalent of this package. For React use [@trustless-work/escrow 5.x](../react-sdk/v2/react-sdk.md); for the REST endpoints and payload shapes see [skills/api/v2/](../api/v2/core-concepts.md).

Use this SDK outside React: Node services, NestJS, Angular, plain browser, scripts, tests, edge runtimes.

---

## Install

```bash
npm i @trustless-work/escrow-js@beta
```

Install under the **`beta`** dist-tag while Core v2 is in beta.

Requires **Node 18+** for global `fetch`. **Zero runtime dependencies** — no Axios, no React.

## Create a client

```ts
import { TrustlessWorkClient, development } from "@trustless-work/escrow-js";

const client = new TrustlessWorkClient({
  baseURL: development,
  apiKey: process.env.API_KEY,
});

await client.rest.listEscrows({ scope: "mine", limit: 20 });
await client.graphql.getEscrow({ contractId: "C..." });
```

This instance pattern is the one to use with dependency injection — NestJS providers, Angular services — and anywhere you need more than one configuration.

There is also a module-level default: `configureTrustlessWork(...)` once at startup, then `getTrustlessWorkClient()`, `escrowRest()` and `escrowGraphql()` anywhere. Prefer the explicit instance in server code; the default is convenient for scripts.

### Options

| Option | Type | Purpose |
| --- | --- | --- |
| `baseURL` | `string` | API host. |
| `apiKey` | `string` | Sent as `x-api-key`. Required for writes. |
| `getAccessToken` | `() => string \| Promise<string>` | Wallet-session auth. **May be async here**, unlike the React SDK. |
| `defaultHeaders` | `Record<string, string>` | Extra headers on every request. |

> **`mainNet` and `development` both resolve to the beta host.** The package exports both names, but while V2 is beta they point at the same URL. `mainNet` does not mean production — V2 is not deployed to mainnet.

---

## The signing loop

Identical to the React SDK, minus the hooks.

```ts
// 1. Build
const { unsignedXdr } = await client.rest.fundEscrow(
  { contractId, signer, amount: 1000 },
  "single-release",
);

// 2. Sign with the wallet the operation requires (your wallet layer)
const signedXdr = await signWithWallet(unsignedXdr);

// 3. Submit
const result = await client.rest.sendTransaction(signedXdr);
```

The build response is `{ unsignedXdr, txHash }`. **`deployEscrow` adds the predicted `contractId`**, so you know the escrow's identity before submitting:

```ts
const { unsignedXdr, txHash, contractId } = await client.rest.deployEscrow(
  payload,
  "single-release",
);
```

### Reading the submit result

```ts
type SendTransactionResponse = {
  txHash: string;
  ledger: number;
  contractId?: string;      // present on deploy confirmation
  escrow?: Escrow;          // present on deploy confirmation
  code?: SendTransactionCode;
  message?: string;
};
```

| `code` | Meaning |
| --- | --- |
| `STELLAR_TX_SUBMITTED` | Submitted and indexed. |
| `STELLAR_TX_SUBMITTED_INDEXER_LAGGING` | **The transaction succeeded.** Only the read model is behind. Do not retry — re-read after a moment. |

Treating the lagging code as a failure and resubmitting is the most expensive mistake available here.

---

## Methods

Same surface as the React SDK, reached through `client.rest` and `client.graphql` instead of hooks.

### Operate — build transactions

`deployEscrow(payload, type, attribution?)` · `fundEscrow(payload, type)` · `updateEscrow(payload, type)` · `manageMilestones(payload, type)` · `changeMilestoneStatus(payload, type)` · `approveMilestones(payload, type)` · `approveAndReleaseMilestones(payload)` · `releaseFunds(payload, type)` · `releaseMilestones(payload)` · `startDispute(payload, type)` · `disputeMilestones(payload)` · `resolveDispute(payload, type)` · `withdrawRemainingFunds(payload, type)`

`releaseMilestones`, `disputeMilestones` and `approveAndReleaseMilestones` are multi-release only and take no `type`. For the first two the operation does not exist on single-release; approve-and-release **does** exist there in the API (`POST /escrow/single-release/v2/approve-and-release-milestones`) — the SDK just does not wrap it, so call that route directly.

`extend-ttl` is not wrapped either — call `POST /escrow/{type}/v2/extend-ttl` directly.

### Submit

`sendTransaction(signedXdr)`

### REST reads

`listEscrows(params?)` · `getEscrow(contractId)` · `getEscrowDetails(contractIds)` · `listEscrowEvents(contractId, params?)` · `getEscrowMilestones(contractId)` · `getEscrowsMilestones(contractIds)` · `getEscrowsFinancial(contractIds)`

Batch methods accept a `string[]` of contract IDs. Use them rather than looping single reads.

> These hit the **read model** at `/escrows/...`, which is neither version-scoped nor type-scoped — there is no `/v2/` in those paths. The v2 transaction controllers expose their own `GET /escrow/{type}/v2/:contractId`, but the SDK does not use it. Read amounts come back as **decimal strings**.

### GraphQL reads

`client.graphql.getEscrow(variables)` · `client.graphql.listEscrows(variables)`

`listEscrows` filters on `scope` (`"mine"` | `"all"`), `status`, `contractType`, `engagementId`, `contractIds`, `participant`, `role`, `platformId`, `subjectId`, `createdAfter`/`createdBefore`. Paginate with `limit` + `cursor` (keyset, not offsets); sort by `createdAt` or `updatedAt`.

---

## Errors

| Class | When |
| --- | --- |
| `TrustlessWorkApiError` | The API answered with a Problem Details body. Carries the status and machine-readable detail. |
| `TrustlessWorkNetworkError` | The request never got a usable response — DNS, timeout, offline. |

Use `parseProblemDetailsFromResponse` when handling a raw `Response` yourself. The React SDK's Axios-specific `parseProblemDetailsFromAxiosError` does not exist here.

---

## Coming from the React SDK

Payloads, responses, error codes and the Core v2 contract are **identical**. Only the React layer is removed.

| React SDK | JS SDK |
| --- | --- |
| `TrustlessWorkConfig` | `new TrustlessWorkClient(...)` or `configureTrustlessWork(...)` |
| `useTrustlessWorkClient()` | your client instance, or `getTrustlessWorkClient()` |
| `useEscrowRest()` | `client.rest` or `escrowRest()` |
| `useEscrowGraphql()` | `client.graphql` or `escrowGraphql()` |
| `useDeployEscrow().deployEscrow` | `client.rest.deployEscrow` |
| `useSendTransaction().sendTransaction` | `client.rest.sendTransaction` |
| `useGraphqlListEscrows().listEscrows` | `client.graphql.listEscrows` |

Every other hook follows the same rule: drop `use`, call the method on `client.rest`.

### Transport differences

| | React SDK | JS SDK |
| --- | --- | --- |
| HTTP | Axios | Native `fetch` |
| Runtime deps | `axios` + React peers | none |
| Token getter | sync only | sync **or** async |
| Non-Problem errors | raw Axios error | `TrustlessWorkNetworkError` |

---

## Common mistakes

* **Destructuring `unsignedTransaction`.** The field is `unsignedXdr`.
* **Retrying on `STELLAR_TX_SUBMITTED_INDEXER_LAGGING`.** The transaction already landed.
* **Assuming `mainNet` is production.** Both host constants point at the beta host today.
* **Expecting read amounts to be numbers.** Operate payloads take numbers; read responses return decimal strings.
* **Installing `latest`.** Use the `@beta` dist-tag while Core v2 is beta.
* **Running on Node < 18.** There is no `fetch` polyfill in the package.
