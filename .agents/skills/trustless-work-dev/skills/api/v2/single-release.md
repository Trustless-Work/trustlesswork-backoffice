# Core API v2 — Single-Release Escrow

> **Protocol version: V2 (BETA), testnet only.** Read [core-concepts.md](core-concepts.md) first for the shared `roles`, `trustline` and `milestone` shapes, the type rules, and the build/sign/submit pattern.

Base path: `/escrow/single-release/v2`

Single-release pays out **once**, to a single `roles.receiver`, after the required milestones are approved. Every write endpoint returns `{ "unsignedXdr": "...", "txHash": "..." }` — the build/sign/submit pattern in core-concepts.

---

## Deploy

`POST /escrow/single-release/v2/deploy` — signed by `signer`

```jsonc
{
  "signer": "G...",                       // signs the deploy; gains no escrow role
  "engagementId": "ENG-12345",            // your reference, max 100 chars, NOT globally unique
  "title": "Website redesign — Q2 2026",  // max 200
  "description": "...",                   // max 2000
  "roles": { /* see core-concepts */ },
  "amount": 1000,                         // number, > 0. Total escrow amount
  "platformFee": 1,                       // percent, 0-100 integer
  "trustline": { "symbol": "USDC", "address": "G..." },
  "milestones": [                         // OPTIONAL in v2 — may be empty or absent
    { "description": "Phase 1", "approvalsTarget": 1 }
  ],
  "receiverMemo": 0                       // optional
}
```

Deploying with no milestones is valid; add them later with `manage-milestones`. Max 50 when present.

## Fund

`POST /escrow/single-release/v2/fund` — signed by `signer`

```jsonc
{ "contractId": "C...", "signer": "G...", "amount": 1000 }
```

Any address holding the asset may fund. Funding grants no role. The signer needs the asset's trustline.

## Update properties

`PUT /escrow/single-release/v2/update` — signed by `admin`

```jsonc
{
  "contractId": "C...",
  "admin": "G...",
  "escrow": {
    "engagementId": "ENG-12345",
    "title": "...",
    "description": "...",
    "amount": 1000,
    "platformFee": 1,
    "receiverMemo": 0,
    "roles": { /* full roles object */ },
    "milestones": [ /* full milestones array */ ],
    "trustline": { /* trustline object */ }
  }
}
```

The `escrow` object is the complete desired state for the escrow's **properties and roles** — but **`milestones` in this payload is ignored**: the contract preserves the existing milestones (and the dispute/released state). Change milestones through `manage-milestones` instead. The API still **requires** the array (1–50 entries) even though the contract ignores it — send the existing milestones back; omitting the field fails validation before reaching the contract.

Only `admin` may call it, it is rejected while a dispute is open, and it only works **before the first `fund` call**: the lock is the cumulative funded amount, which never decreases, so releasing funds does not make the escrow editable again.

## Manage milestones

`POST /escrow/single-release/v2/manage-milestones` — signed by `admin`

```jsonc
{
  "contractId": "C...",
  "admin": "G...",
  "newMilestones": [
    { "description": "Phase 2", "approvalsTarget": 2 }
  ],
  "milestoneUpdates": [
    { "index": 0, "newDescription": "Phase 1 — revised" }
  ]
}
```

Appends new milestones and edits existing descriptions (`newDescription` max 500 chars).

## Change milestone status

`POST /escrow/single-release/v2/change-milestone-status` — signed by one of `serviceProviders`

```jsonc
{
  "contractId": "C...",
  "serviceProvider": "G...",
  "updates": [
    { "index": 0, "newStatus": "completed", "newEvidence": "https://..." }
  ]
}
```

Batched. Status is free text (max 50 chars) and moves no funds; convention is `pending → in_progress → completed`. `newEvidence` is optional, max 500 chars.

## Approve milestones

`POST /escrow/single-release/v2/approve-milestones` — signed by one of `approvers`

```jsonc
{
  "contractId": "C...",
  "approver": "G...",
  "milestoneIndexes": [0, 1]
}
```

Casts **one** approver's vote on each listed milestone. A milestone counts as approved once distinct approvals reach its `approvalsTarget`. An approver cannot vote twice, and approval is irreversible.

## Approve and release

`POST /escrow/single-release/v2/approve-and-release-milestones` — signed by an address that is **both** an approver and a release signer

```jsonc
{
  "contractId": "C...",
  "signer": "G...",
  "milestoneIndexes": [0, 1]
}
```

Collapses approval and release into one transaction. Use it only when a single wallet legitimately holds both roles.

## Release funds

`POST /escrow/single-release/v2/release-funds` — signed by one of `releaseSigners`

```jsonc
{ "contractId": "C...", "releaseSigner": "G..." }
```

Requires **all** milestones approved and no active dispute. Pays the configured `amount` minus the platform fee and the Trustless Work protocol fee to `roles.receiver`. The contract balance must cover it. An escrow with **zero milestones cannot release** (`NoMilestoneDefined`) — add milestones first.

## Raise a dispute

`POST /escrow/single-release/v2/dispute` — signed by `signer`

```jsonc
{ "contractId": "C...", "signer": "G...", "reason": "Deliverable does not match scope" }
```

Disputes the **whole escrow**. `reason` is required in v2 (v1 had none), max 500 chars. Approvers, service providers, release signers, the platform and the receiver may raise one; a `disputeResolver` is rejected.

## Resolve a dispute

`POST /escrow/single-release/v2/resolve-dispute` — signed by one of `disputeResolvers`

```jsonc
{
  "contractId": "C...",
  "disputeResolver": "G...",
  "distributions": [
    { "address": "G...", "amount": 600 },
    { "address": "G...", "amount": 400 }
  ]
}
```

Max 50 entries, every amount positive, and the total must equal the **entire current contract balance exactly** (`DistributionsMustEqualEscrowBalance` otherwise). The escrow must be disputed. Every recipient needs the asset's trustline. Resolution is terminal — a dispute cannot be reopened.

## Withdraw remaining funds

`POST /escrow/single-release/v2/withdraw-remaining-funds` — signed by one of `disputeResolvers`

```jsonc
{
  "contractId": "C...",
  "disputeResolver": "G...",
  "distributions": [ { "address": "G...", "amount": 25 } ]
}
```

Sweeps leftover balance — overfunding, stray transfers, rounding dust. In v2 the escrow must be genuinely terminal: `released` or the dispute `resolved`. An open dispute does **not** qualify (it did in v1). The distributions must sum to the **entire remaining balance** — it is a full sweep, not a partial withdrawal, which v1 allowed.

It is fee-bearing: each recipient's amount is reduced pro rata by the platform and protocol fees, and recipients receive the net.

## Extend TTL

`POST /escrow/single-release/v2/extend-ttl` — signed by `admin`

```jsonc
{ "contractId": "C...", "admin": "G...", "ledgersToExtend": 100000 }
```

Extends Soroban storage so the escrow does not expire and get archived.

---

## Reads

`GET /escrow/single-release/v2/:contractId`

Returns the escrow. Note the v2 shape: no `flags` object, `approvals` instead of a boolean, role arrays.

```jsonc
{
  "type": "single-release",
  "contractId": "C...",
  "contractBaseId": "C...",
  "engagementId": "ENG-12345",
  "title": "...",
  "description": "...",
  "amount": 1000,
  "balance": 1000,
  "platformFee": 1,
  "receiverMemo": 0,
  "trustline": { "address": "G...", "contractId": "C...", "symbol": "USDC" },
  "roles": {
    "approvers": ["G..."], "serviceProviders": ["G..."], "platform": "G...",
    "releaseSigners": ["G..."], "disputeResolvers": ["G..."],
    "receiver": "G...", "admin": "G...", "observers": []
  },
  "milestones": [
    {
      "description": "Phase 1",
      "status": "completed",
      "evidence": "https://...",
      "approvals": { "target": 2, "approvalCount": 1, "approvedBy": ["G..."] }
    }
  ],
  "dispute": { "isDisputed": false, "reason": "", "resolved": false },
  "released": false
}
```

`GET /escrow/single-release/v2/escrow-balances?addresses=C...&addresses=C...`

Batch balance lookup — max 20 contract addresses per call.
