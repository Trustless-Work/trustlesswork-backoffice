# Trustless Work Constitution

The compressed, agent-facing representation of the rules that govern Trustless Work escrows — so AI agents never invent permissions, skip enforced preconditions, or design flows the smart contract will reject.

This file holds the laws that apply **regardless of protocol version**, the rule for choosing a version, and an explanation of **both** versions. The full version-specific rules live in the protocol profiles:

- **[skills/protocol/v1.md](skills/protocol/v1.md)** — production. Deployed on mainnet and testnet; the default for every integration.
- **[skills/protocol/v2.md](skills/protocol/v2.md)** — beta. Deployed on testnet only; usable there, never on mainnet.

## Source-of-Truth Hierarchy

This file is **not** an independent source of truth. When layers disagree, trust the higher layer and flag the inconsistency to the user:

1. Deployed, audit-bound smart-contract behavior
2. Deployed API schema and current SDK types for the same protocol version
3. Official developer documentation ([docs.trustlesswork.com](https://docs.trustlesswork.com/trustless-work))
4. The protocol profile for the version in question (`skills/protocol/v1.md`, `skills/protocol/v2.md`)
5. This file (`constitution.md`)
6. Detailed local skill reference files (`skills/**`)

## How to Read This File

Every statement is tagged:

- **[ENFORCED]** — the contract or API rejects violations. Never design around these.
- **[CANONICAL]** — the recommended integration sequence or pattern. Deviating is allowed when technically valid; do not refuse a valid integration merely because it diverges from the recommended flow.
- **[SECURITY]** — best-practice constraint. Flag deviations to the user before implementing them.
- **[FACT]** — current product/deployment/config value. May change between versions or deployments; verify when critical.

---

## Article I — Protocol Version Selection

**This article governs every other rule in the skill. Apply it before answering anything about roles, payloads, or lifecycle.**

1. **V1 is the default.** V1 is the only Trustless Work protocol deployed on **mainnet** and the current production builder product. Any normal request — "build me an escrow integration", "which version should I use in production" — is answered from [skills/protocol/v1.md](skills/protocol/v1.md).

2. **[ENFORCED] Version availability is bound to the network.**
   - **Mainnet: V1 only.** V2 is not deployed there. Never generate a mainnet integration on V2, and never recommend V2 as a production path while it remains beta.
   - **Testnet: both.** V2 is deployed on testnet, so building on V2 there is legitimate. Label it beta every time.

   Both versions are fully documented here and in the profiles. Explaining V2 is always in scope; an agent that cannot explain V2 is not doing its job. The constraint is which network the integration targets, not whether the user asked the magic word.

3. **Never mix versions.** Roles, payload shapes, approval semantics, lifecycle preconditions and examples belong to one version at a time. A V2 field in a V1 integration is a defect, and the reverse is equally wrong.

4. **When the version is ambiguous, choose V1** and say which version the answer describes.

5. **Cross-chain is a separate beta track.** The `*-develop-v2-crosschain` contract branches are outside both profiles. Do not fold them into normal guidance unless the user asks for cross-chain specifically.

6. **[FACT]** Escrow type and protocol version are independent axes. "Single Release" does not identify a contract surface on its own; there is a V1 and a V2 of each type. Always state both.

### The two versions

Both versions are explained here so an agent can reason about either one and recognize which a codebase targets. The full rules live in the profiles: [v1.md](skills/protocol/v1.md) and [v2.md](skills/protocol/v2.md).

#### V1 — production, live on mainnet

**Roles.** One address per role: `approver`, `serviceProvider`, `releaseSigner`, `disputeResolver`, `receiver`, `platformAddress`. There is no `admin`; the `platformAddress` is what updates the escrow, and it also receives the platform fee.

**Approval.** A milestone carries a boolean set by the single approver. It is irreversible.

**State.** Release, dispute and resolution live in a `flags` object — on the escrow in single-release, on each milestone in multi-release.

**Role overlap.** Permitted by design and treated as a configurator choice, with one contract prohibition: the address assigned as `disputeResolver` cannot raise a dispute.

**Disputes.** Carry no reason text. Single-release disputes the whole escrow and its resolution must distribute exactly the escrow balance; multi-release disputes and resolves per milestone, bounded by that milestone's amount.

#### V2 — BETA, testnet only

> Deployed on **testnet**, not on mainnet. You can build on V2 against testnet; you cannot ship it to mainnet while it is beta. Every V2 answer must say it is beta.

**Roles.** Most roles became address collections capped at 5: `approvers`, `serviceProviders`, `releaseSigners`, `disputeResolvers`, `observers`. A dedicated single-address `admin` owns escrow updates and milestone management, which leaves `platform` as fee-only. `observers` is read-only and, unlike V1, actually implemented.

**Approval.** Threshold-based. Each milestone declares how many approvals it needs; approvers vote individually, cannot vote twice, and the milestone is approved once the count reaches the target. A target of 1 reproduces V1 behavior but the field is still a structure, never a boolean.

**State.** The `flags` object is gone. Release and dispute state are direct fields, and a dispute carries a reason string.

**Role overlap.** Now contract-enforced rather than a configurator choice: `disputeResolvers` may not overlap any other role, including `platform` and any milestone receiver, and `admin` may not be a payee. `admin` and `platform` may deliberately share an address — that pair is a capability distinction, not an address-separation rule.

**Operations.** Adds batch approval, approve-and-release in one transaction, and milestone management after creation (append or edit — never remove). Escrow properties, roles and milestone edits freeze at the **first `fund` call** — the lock is the cumulative funded amount, which never decreases, not the live balance; appending milestones stays allowed after funding. `withdraw-remaining-funds` is narrowed to genuinely terminal states, unlike V1 which also permits it during an open dispute, and must sweep the entire remaining balance, unlike V1 which allowed partial withdrawals.

#### Recognizing a version in existing code

A `flags` object or a singular `roles.approver` means V1. Address arrays or an `admin` role mean V2.

#### What did not change

The non-custodial model and the build/sign/submit sequence, the API-key requirement, the trustline and network rules, and the hardcoded mainnet protocol-fee address. Those are the universal laws below and they apply to both versions.

---

## Article II — Foundational Principles

### 1. Non-custodial, always

**[ENFORCED]** Funds live in a Soroban smart-contract escrow on Stellar — never in Trustless Work's or the platform's custody. Write endpoints return an **unsigned XDR transaction**; only a signature from the required/authorized signer makes it valid.

**[SECURITY]** Never design flows that collect users' Stellar secret keys or sign on their behalf server-side.

### 2. State-transition authority is role-gated

**[ENFORCED]** Escrow state-transition authority **after deployment** is role-gated, with one exception: funding, which is authorized by the funding signer (any depositor). Deployment is authorized by the deploy signer but grants no escrow role. The smart contract enforces the role gates — a UI cannot grant what the contract denies. Flows that assume an actor can perform an action their assigned role(s) do not permit will fail on-chain.

Which roles exist and what each may do is version-specific. See the protocol profile.

### 3. The chain is the source of truth

**[CANONICAL]** Indexer queries may serve cached data. Before critical operations (release, dispute, resolve), query with `validateOnChain=true`.

---

## Article III — Universal API Laws

1. **[ENFORCED]** `x-api-key` header on **every** request — including read-only indexer queries. Verified against the deployed API: reads without a key return `401 Unauthorized`. Never `Authorization: Bearer` for the API-key requirement.
2. **[ENFORCED]** Every write operation is 3 steps: **build** (API returns unsigned XDR) → **sign** (with the signer authorized for that operation) → **submit** (`POST /helper/send-transaction`). A new escrow's on-chain contract exists only after the signed deployment transaction is successfully submitted.
3. **[FACT]** Rate limit: **50 requests per 60 seconds** per client (`429` beyond it).

Payload-shape rules — types, field names, amount encodings — are version-specific. See the protocol profile.

---

## Article IV — Network Laws

1. **[ENFORCED]** Testnet (`https://dev.api.trustlesswork.com`) and mainnet (`https://api.trustlesswork.com`) are separate networks with separate assets/issuers and credentials. Mixing a testnet issuer with mainnet or using the wrong network passphrase makes transactions fail.
   - **[FACT]** USDC testnet issuer: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
   - **[FACT]** USDC mainnet issuer: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
2. **[ENFORCED — by Stellar]** An account must have the relevant asset trustline and satisfy Stellar reserve requirements before it can hold or receive that classic Stellar asset. Therefore the **depositor** and every address that will **receive tokens** — receiver(s), the platform address when receiving fees, and dispute-distribution addresses — need the relevant trustline before that transfer reaches them. Authority-only actions (approve, release-sign, resolve) are signatures, not token transfers, and do not by themselves require holding the asset.
3. **[FACT]** The additional base reserve associated with a trustline is a Stellar network parameter (commonly 0.5 XLM at the time of this version); treat the numeric reserve as versioned network configuration, not an immutable Trustless Work protocol law.
4. **[SECURITY]** The Trustless Work protocol-fee address is **hardcoded in the mainnet contract lineage** and passed as a parameter only on the testnet lineage, in both V1 and V2. This is deliberate: the destination of protocol fees must never be caller-supplied on mainnet. Treat it as a network-level property, not a version difference, and never present the parameter form as the preferred shape.
5. **[CANONICAL]** Always develop and test on testnet first.

---

## Article V — Agent Conduct

1. **Never work around an [ENFORCED] law.** If a requested feature violates one — for example a dispute action signed by the dispute resolver, changing frozen properties of a funded escrow, or sending a payload shape the target version rejects — flag the conflict to the user instead of implementing it. A **[CANONICAL]** deviation that remains technically valid is acceptable; note the deviation.
2. When this file disagrees with a higher layer of the Source-of-Truth Hierarchy, **the higher layer wins**. Verify against the matching protocol version's deployed/audit-bound contract, deployed API/Swagger, SDK types, or official docs, then propose an amendment here.
3. **Never invent endpoints, fields, roles, or behavior.** If official documentation is silent or conflicts with a higher source, use the higher source and state which source supports the behavior rather than treating documentation silence as a prohibition.
4. **[SECURITY]** Key model: Trustless Work **API keys** are client-visible application keys in the current SDK pattern (`NEXT_PUBLIC_API_KEY`). Still: never commit them to repositories, and rotate them from the dApp if leaked. Stellar **secret keys** (`S...`) are absolute secrets: they never leave the user's wallet, are never logged, and never touch a server. Server-side signing may satisfy on-chain authorization if it holds the authorized key, but custodial handling of a user's secret key violates the intended non-custodial security model.
5. **Version discipline.** State which protocol version an answer describes. Do not import V2 beta behavior into a V1 answer, and do not silently upgrade a V1 question into a V2 answer because V2 is newer.
6. **Branches are not deployments.** A contract branch name is not proof that its code is deployed or audit-bound. Where no WASM hash, tag or deployment manifest is available, say so rather than implying deployment status.

---

**Sources**: [Smart-contract source](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar) · [Roles in Trustless Work](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/roles-in-trustless-work) · [Escrow Lifecycle](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-lifecycle) · [Dispute Resolution](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-lifecycle/dispute-resolution) · [Release Phase](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-lifecycle/release-phase) · [API Introduction](https://docs.trustlesswork.com/trustless-work/api-rest/introduction) · [Trustlines](https://docs.trustlesswork.com/trustless-work/introduction/stellar-and-soroban-the-backbone-of-trustless-work/trustlines)

**Version**: 2.0.0 — restructured 2026-09-08 into universal laws plus version profiles (issue #6). V1 remains the production default; V2 is documented as beta in `skills/protocol/v2.md`.
