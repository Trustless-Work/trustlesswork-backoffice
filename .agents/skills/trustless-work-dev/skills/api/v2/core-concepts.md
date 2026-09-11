# Core API v2 — Concepts

> **Protocol version: V2 (BETA).** V2 runs on its own host, `https://beta.api.trustlesswork.com`, against testnet. It is **not** on the V1 hosts and not on mainnet. For production use [V1](../core-concepts.md). See [constitution.md](../../../constitution.md) for the version-selection rule.

Everything here is verified against the Core API source. Shared shapes and rules live in this file; the per-endpoint reference is in [single-release.md](single-release.md) and [multi-release.md](multi-release.md).

---

## Routes are version-scoped

Every v2 operation lives under a versioned prefix:

```
/escrow/single-release/v2/...
/escrow/multi-release/v2/...
```

There is no unversioned v2 route. Sending a v2 payload to a v1 route, or the reverse, fails.

## Base URL

```
https://beta.api.trustlesswork.com
```

V2 has its **own host**. It is not served from the V1 hosts (`api.trustlesswork.com` for mainnet, `dev.api.trustlesswork.com` for testnet) — pointing a V2 integration at either of those fails. The beta host settles on Stellar testnet.

## Authentication

`x-api-key` on **every** request, including reads. Never `Authorization: Bearer`.

## The write pattern

Every write endpoint **builds** a transaction; it does not execute one. The response is:

```json
{ "unsignedXdr": "AAAAAgAAAAB...", "txHash": "..." }
```

The field is **`unsignedXdr`**, not `unsignedTransaction`. `deploy` returns the same shape plus the predicted `contractId`:

```json
{ "unsignedXdr": "...", "txHash": "...", "contractId": "C..." }
```

Three steps, always:

1. **Build** — call the endpoint, receive the unsigned XDR.
2. **Sign** — sign client-side with the wallet the operation requires. Each endpoint below names that signer.
3. **Submit** — `POST /stellar/send-transaction` with the signed XDR.

> The submit route differs from V1, which documents `/helper/send-transaction`. In the v2 API there is no `helper` controller.

Nothing reaches the chain until step 3.

The submit response always carries `txHash` and `ledger`. The rest depends on what was submitted:

- **Successful factory deploy** — `contractId` plus the initial `escrow` snapshot. **No `code` field.**
- **Everything else** — a machine-readable `code`:

| Code | Meaning |
| --- | --- |
| `STELLAR_TX_SUBMITTED` | Plain (non-deploy) transaction submitted successfully. |
| `STELLAR_TX_SUBMITTED_INDEXER_LAGGING` | Deploy **submitted successfully**, but the contract's return value was not indexed in time. Not an error — do not retry. Fetch the contract via `getTransaction(txHash)` or re-read shortly. |

Branch on `code` when present, or on the presence of `contractId`, to know which variant you received. `message` is human-readable and unstable — never branch on it.

---

## Shared objects

### `roles`

The v2 role model. Most roles are **arrays** of up to 5 unique addresses; `platform`, `admin` and `receiver` are single addresses.

```jsonc
{
  "approvers":        ["G..."],   // 1-5, unique. Approve milestones
  "serviceProviders": ["G..."],   // 1-5, unique. Change milestone status
  "releaseSigners":   ["G..."],   // 1-5, unique. Release funds
  "disputeResolvers": ["G..."],   // 1-5, unique. Resolve disputes
  "platform":         "G...",     // single. Receives the platform fee
  "admin":            "G...",     // single. update, manage-milestones, extend-ttl
  "receiver":         "G...",     // single. SINGLE-RELEASE ONLY
  "observers":        []          // optional, read-only, no on-chain authority
}
```

**Multi-release has no `receiver` in `roles`** — each milestone carries its own.

Composition rules the API and contract reject:

- Duplicates inside a role array, or more than 5 entries.
- `disputeResolvers` overlapping any other role, including `platform` and any milestone receiver.
- `admin` overlapping any other role, including a milestone receiver.

`admin` and `platform` **may** be the same address: that pair is a capability distinction, not an address-separation rule.

### `trustline`

v2 accepts **either** form. This differs from v1, which takes the issuer address only.

```jsonc
// Form A — Soroban token contract
{ "contractId": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" }

// Form B — issuer + symbol, resolved to the contract by the API
{ "symbol": "USDC", "address": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" }
```

Supply `contractId`, or supply both `symbol` and `address`. When `contractId` is present the other two are ignored.

### `milestone`

**Single-release** — a tracking unit. It holds no funds and no receiver.

```jsonc
{
  "description": "Phase 1 — UI design delivery",  // required
  "status": "pending",                            // optional, defaults to "pending"
  "approvalsTarget": 1                            // optional, defaults to 1
}
```

**Multi-release** — independently funded and released, so it adds its own amount and receiver.

```jsonc
{
  "description": "Phase 1 — UI design delivery",  // required
  "amount": 500,                                  // required, > 0
  "receiver": "G...",                             // required
  "status": "pending",                            // optional
  "approvalsTarget": 1                            // optional, defaults to 1
}
```

`approvalsTarget` must be `> 0` and `<= roles.approvers.length`. It is how many **distinct** approvers must approve before the milestone counts as approved. A target of 1 behaves like v1's boolean, but the field is always a threshold.

---

## Type rules

| Field | Type | Note |
| --- | --- | --- |
| `amount` (operate payloads) | `number` | Human-readable decimals (`1000`, not `"1000"`). |
| `amount` (read responses) | surface-dependent | The read model (`/escrows/...`) returns **decimal strings**; the versioned `GET /escrow/.../v2/:contractId` returns **numbers**. See “Two read surfaces”. |
| `platformFee` | `number` | **Percent**, integer 0–100 (`1` means 1%). Scaled to basis points on-chain. |
| `milestoneIndexes` | `number[]` | **Numbers, not strings.** v1's `milestoneIndex` was a string; v2 takes an array of numbers. |
| `approvalsTarget` | `number` | Integer ≥ 1. |
| `ledgersToExtend` | `number` | Integer. |
| `receiverMemo` | `number` | Optional, u32 on-chain. |
| Addresses | `string` | `G…` accounts, `C…` contracts. |

## Field limits at deploy

| Field | Limit |
| --- | --- |
| `engagementId` | 100 chars |
| `title` | 200 chars |
| `description` | 2000 chars |
| `milestones` | max 50 entries |

> These differ from v1, which caps `title` at 100 and `description` at 500. Do not reuse v1 limits.

---

## What changed from v1

| | v1 | v2 |
| --- | --- | --- |
| Route prefix | unversioned | `/v2/` required |
| Roles | one address each | arrays of up to 5, plus `admin` and `observers` |
| Approval | boolean per milestone | threshold (`approvalsTarget`) |
| Milestone index | `"0"` string, one at a time | `[0, 1]` numbers, batched |
| Trustline | issuer address only | `contractId` **or** issuer + symbol |
| Milestones at deploy | at least 1 required | **optional** — deploy empty, add later |
| Batch operations | none | approve, approve-and-release, dispute, release |
| Escrow update | `platformAddress` | `admin`, via `PUT /update` |

---

## Endpoint index

Both variants expose the same 14 operations. Names differ only for disputes.

| Operation | Method | Path suffix | Signer |
| --- | --- | --- | --- |
| Deploy | POST | `/deploy` | `signer` |
| Fund | POST | `/fund` | `signer` (any depositor) |
| Update properties | PUT | `/update` | `admin` |
| Manage milestones | POST | `/manage-milestones` | `admin` |
| Change milestone status | POST | `/change-milestone-status` | one of `serviceProviders` |
| Approve milestones | POST | `/approve-milestones` | one of `approvers` |
| Approve and release | POST | `/approve-and-release-milestones` | approver + release signer |
| Release funds | POST | `/release-funds` | one of `releaseSigners` |
| Raise dispute | POST | `/dispute` (single) · `/dispute-milestones` (multi) | see endpoint |
| Resolve dispute | POST | `/resolve-dispute` | one of `disputeResolvers` |
| Withdraw remaining | POST | `/withdraw-remaining-funds` | one of `disputeResolvers` |
| Extend TTL | POST | `/extend-ttl` | `admin` |
| Get escrow | GET | `/:contractId` | — |
| Get balances | GET | `/escrow-balances` | — |

---

## Two read surfaces — do not confuse them

Reads exist in two places, and **both SDKs use the second one**.

**1. On the v2 transaction controllers** — version- and type-scoped:

```
GET /escrow/{single-release|multi-release}/v2/:contractId
GET /escrow/{single-release|multi-release}/v2/escrow-balances
```

**2. The read model** — a separate controller that is **neither version-scoped nor type-scoped**:

```
GET /escrows                        # keyset list, filterable
GET /escrows/:contractId            # one escrow
GET /escrows/:contractId/events     # event history
GET /escrows/:contractId/milestones # milestones for one escrow
GET /escrows/details                # batch detail lookup
GET /escrows/financial              # batch financial summary
GET /escrows/milestones             # batch milestones
```

There is no `/v2/` in these paths. `@trustless-work/escrow` 5.x and `@trustless-work/escrow-js` route every read method here — `getEscrow`, `listEscrows`, `getEscrowDetails`, `listEscrowEvents`, `getEscrowMilestones`, `getEscrowsMilestones`, `getEscrowsFinancial`.

So if you are reading through an SDK you are on surface 2, and adding `/v2/` to those paths is wrong. Surface 1 is reached only by calling the transaction controller directly.

**Amount types differ by surface**: the read model (surface 2) returns amounts and balances as **decimal strings**, unlike the numbers you send in operate payloads; the versioned reads (surface 1) return them as numbers.
