# Core API v2 — Multi-Release Escrow

> **Protocol version: V2 (BETA), testnet only.** Read [core-concepts.md](core-concepts.md) first for the shared `roles`, `trustline` and `milestone` shapes, the type rules, and the build/sign/submit pattern.

Base path: `/escrow/multi-release/v2`

Multi-release pays out **per milestone**. Each milestone carries its own `amount` and `receiver`, and is approved, released and disputed independently.

## The three differences from single-release

1. **No top-level `amount`** on the escrow, and **no `receiver` in `roles`**. Both live on each milestone.
2. **Operations take `milestoneIndexes`.** Release and dispute are scoped to the milestones you name, not the whole escrow.
3. **Disputes are per milestone**, so the endpoint is `/dispute-milestones`, not `/dispute`.

Everything else — auth, the build/sign/submit pattern, role composition rules, trustline forms, field limits — matches [core-concepts.md](core-concepts.md).

---

## Deploy

`POST /escrow/multi-release/v2/deploy` — signed by `signer`

```jsonc
{
  "signer": "G...",
  "engagementId": "ENG-12345",
  "title": "Grant programme — cohort 3",
  "description": "...",
  "roles": { /* no `receiver` here */ },
  "platformFee": 1,                       // no top-level `amount`
  "trustline": { "symbol": "USDC", "address": "G..." },
  "milestones": [                         // OPTIONAL — may be empty or absent
    { "description": "Tranche 1", "amount": 500, "receiver": "G...", "approvalsTarget": 1 },
    { "description": "Tranche 2", "amount": 500, "receiver": "G...", "approvalsTarget": 2 }
  ],
  "receiverMemo": 0
}
```

Each milestone needs `description`, `amount` (> 0) and `receiver`. Max 50.

## Fund

`POST /escrow/multi-release/v2/fund` — signed by `signer`

```jsonc
{ "contractId": "C...", "signer": "G...", "amount": 1000 }
```

Fund the escrow as a whole. The canonical target is the sum of the milestone amounts.

## Update properties

`PUT /escrow/multi-release/v2/update` — signed by `admin`

```jsonc
{
  "contractId": "C...",
  "admin": "G...",
  "escrow": {
    "engagementId": "ENG-12345",
    "title": "...",
    "description": "...",
    "platformFee": 1,
    "receiverMemo": 0,
    "roles": { /* full roles object, no receiver */ },
    "milestones": [ /* full milestones array */ ],
    "trustline": { /* trustline object */ }
  }
}
```

Complete desired state for the escrow's **properties and roles** — **`milestones` in this payload is ignored**; the contract preserves the existing ones. Use `manage-milestones` for milestones — but the API still **requires** the array (1–50 entries): send the existing milestones back, omitting the field fails validation. `admin` only, rejected while any milestone is disputed, and only **before the first `fund` call** — the lock is the cumulative funded amount, which never decreases.

## Manage milestones

`POST /escrow/multi-release/v2/manage-milestones` — signed by `admin`

```jsonc
{
  "contractId": "C...",
  "admin": "G...",
  "newMilestones": [
    { "description": "Tranche 3", "amount": 250, "receiver": "G...", "approvalsTarget": 1 }
  ],
  "milestoneUpdates": [
    { "index": 0, "newDescription": "Tranche 1 — revised", "newAmount": 600 }
  ]
}
```

Multi-release updates can change a milestone's **amount** as well as its description (`newDescription` max 500 chars) — single-release cannot, since the amount lives on the escrow. **Every** milestone edit (description or amount) is rejected once the escrow has been funded; appending new milestones stays allowed until the escrow is released, disputed or resolved.

A new milestone's `receiver` must not be the `admin` or any `disputeResolver`. The contract rejects that configuration.

## Change milestone status

`POST /escrow/multi-release/v2/change-milestone-status` — signed by one of `serviceProviders`

```jsonc
{
  "contractId": "C...",
  "serviceProvider": "G...",
  "updates": [ { "index": 0, "newStatus": "completed", "newEvidence": "https://..." } ]
}
```

Same rules as single-release: `newStatus` max 50 chars, `newEvidence` optional, max 500.

## Approve milestones

`POST /escrow/multi-release/v2/approve-milestones` — signed by one of `approvers`

```jsonc
{ "contractId": "C...", "approver": "G...", "milestoneIndexes": [0, 1] }
```

One approver's vote on each listed milestone; approved once distinct approvals reach that milestone's `approvalsTarget`.

## Approve and release

`POST /escrow/multi-release/v2/approve-and-release-milestones` — signed by an address holding both roles

```jsonc
{ "contractId": "C...", "signer": "G...", "milestoneIndexes": [0] }
```

## Release funds

`POST /escrow/multi-release/v2/release-funds` — signed by one of `releaseSigners`

```jsonc
{ "contractId": "C...", "releaseSigner": "G...", "milestoneIndexes": [0, 1] }
```

Releases **only** the named milestones — unlike single-release, which pays the whole escrow at once and requires every milestone approved. Each listed milestone must be approved, not already released, and not disputed. Each pays its own `amount` minus fees to its own `receiver`.

## Raise a dispute

`POST /escrow/multi-release/v2/dispute-milestones` — signed by `signer`

```jsonc
{
  "contractId": "C...",
  "signer": "G...",
  "milestoneIndexes": [1],
  "reason": "Tranche 2 deliverable incomplete"
}
```

Disputes specific milestones, leaving the rest of the escrow operative. `reason` is required, max 500 chars. Approvers, service providers, release signers, the platform and that milestone's receiver may raise one; a `disputeResolver` is rejected.

## Resolve a dispute

`POST /escrow/multi-release/v2/resolve-dispute` — signed by one of `disputeResolvers`

```jsonc
{
  "contractId": "C...",
  "disputeResolver": "G...",
  "milestoneIndexes": [1],
  "distributions": [
    { "address": "G...", "amount": 300 },
    { "address": "G...", "amount": 200 }
  ]
}
```

Scoped to the named milestones, which must each be disputed and not already resolved (duplicates in `milestoneIndexes` are rejected). Distributions: max 50 entries, every amount positive, and the total must equal the **combined amount of the named milestones exactly** (`DistributionsMustEqualEscrowBalance` otherwise) — not less, not more. The contract balance must cover that total. It does not have to equal the full escrow balance, since resolution is per milestone. Resolution is terminal for those milestones.

## Withdraw remaining funds

`POST /escrow/multi-release/v2/withdraw-remaining-funds` — signed by one of `disputeResolvers`

```jsonc
{
  "contractId": "C...",
  "disputeResolver": "G...",
  "distributions": [ { "address": "G...", "amount": 25 } ]
}
```

Requires **every** milestone to be terminal — released or its dispute resolved. The distributions must sum to the **entire remaining balance**: a full sweep, not a partial withdrawal. Fee-bearing, same as single-release.

## Extend TTL

`POST /escrow/multi-release/v2/extend-ttl` — signed by `admin`

```jsonc
{ "contractId": "C...", "admin": "G...", "ledgersToExtend": 100000 }
```

---

## Reads

`GET /escrow/multi-release/v2/:contractId`

Same shape as single-release except: no top-level `amount`, no `roles.receiver`, and each milestone carries `amount`, `receiver`, `released` and its own `dispute` object.

```jsonc
{
  "type": "multi-release",
  "contractId": "C...",
  "milestones": [
    {
      "description": "Tranche 1",
      "amount": 500,
      "receiver": "G...",
      "status": "completed",
      "evidence": "https://...",
      "approvals": { "target": 2, "approvalCount": 2, "approvedBy": ["G...", "G..."] },
      "released": true,
      "dispute": { "isDisputed": false, "reason": "", "resolved": false }
    }
  ]
}
```

`GET /escrow/multi-release/v2/escrow-balances?addresses=C...&addresses=C...` — max 20 addresses per call.
