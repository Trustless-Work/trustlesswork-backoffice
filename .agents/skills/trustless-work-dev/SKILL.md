---
name: trustless-work-dev
description: >
  Use when integrating Trustless Work escrow, deploying single-release or multi-release escrow
  contracts, handling milestone-based payments, releasing funds, managing disputes on Stellar, or
  working with the REST API, React SDK (@trustless-work/escrow hooks), or Blocks SDK (pre-built UI).
  Also use when users mention escrow, conditional payments, non-custodial payments, USDC escrow,
  freelance platforms, marketplace payments, grant disbursements, Soroban contracts, or Stellar
  blockchain payments — even if they don't explicitly mention Trustless Work.
license: Apache-2.0
compatibility: Designed for Claude Code and compatible AI coding assistants. Requires network access to query Trustless Work APIs.
metadata:
  author: Trustless Work
  version: "1.0"
allowed-tools: mcp__trustless-work__searchDocumentation mcp__trustless-work__getPage
---

# Trustless Work Development Skill

[View on skills.sh](https://www.skills.sh/trustless-work/trustlesswork-skill)

This skill provides comprehensive guidance for integrating Trustless Work escrow contracts into applications. Use the reference files below for detailed implementation guides.

## Quick Start

### Installation

Install this skill using:

```bash
npx skills add trustless-work/trustlesswork-skill
```

### Protocol version — read this first

Trustless Work has two protocol versions, and they are not interchangeable.

- **V1 is production and the default.** It is the only version deployed on mainnet. Build every normal integration from [skills/protocol/v1.md](skills/protocol/v1.md).
- **V2 is beta and testnet-only.** It is deployed on testnet, so you can build on it there — contract semantics in [skills/protocol/v2.md](skills/protocol/v2.md), REST endpoints in [skills/api/v2/](skills/api/v2/core-concepts.md), React SDK in [skills/react-sdk/v2/](skills/react-sdk/v2/react-sdk.md), JS SDK in [skills/js-sdk/](skills/js-sdk/js-sdk.md) — but never on mainnet while it is beta, and never as the recommended production path. Say it is beta every time.
- **Explaining V2 is always in scope.** Answer any V2 question; the restriction is which network you target, not whether the user said "beta".
- **Never mix them.** Roles, payload shapes, approval semantics and lifecycle rules belong to one version at a time.
- **If the version is ambiguous, use V1** and state which version you are describing.

Escrow type (single-release or multi-release) and protocol version are independent: there is a V1 and a V2 of each. Always know both before writing code.

### When working with Trustless Work:

1. **Know the platform laws** — Read [constitution.md](constitution.md) before designing any escrow flow: the universal laws and the version-selection rule, each tagged as contract-enforced, canonical workflow, security practice, or versioned fact. Then load the profile for the version you are targeting.
2. **Configure MCP (recommended)** — See [MCP Integration](#mcp-integration) below for live docs and escrow tools
3. **Understand core concepts** - See [skills/api/core-concepts.md](skills/api/core-concepts.md)
4. **Choose escrow type**:
   - Single-release: One payment after all milestones - See [skills/api/single-release-escrow.md](skills/api/single-release-escrow.md)
   - Multi-release: Payments per milestone - See [skills/api/multi-release-escrow.md](skills/api/multi-release-escrow.md)
5. **Configure trustlines** - See [skills/api/trustlines.md](skills/api/trustlines.md)
6. **Choose integration method**:
   - **REST API**: Direct API calls - See [skills/api/](skills/api/) folder
   - **React SDK**: Custom hooks for React/Next.js - See [skills/react-sdk/react-sdk.md](skills/react-sdk/react-sdk.md)
   - **Blocks SDK**: Pre-built UI components - See [skills/blocks/introduction.md](skills/blocks/introduction.md)
7. **Implement workflow**: Deploy → Fund → Complete → Approve → Release

## Gotchas

These are the non-obvious facts that the agent will get wrong without being told:

- **`amount` is always a `number`**: Across the entire V1 integration — `deploy`, `fund-escrow`, milestone amounts, and React SDK's `FundEscrowPayload` — send `1000`, never `"1000"`.
- **`milestoneIndex` is always a string**: Pass `"0"` not `0` — even though it looks numeric.
- **Don't include `status` or `approvedFlag` in single-release milestone objects when deploying**: Only `description` is valid on V1 Single Release deploy. Adding those fields causes errors.
- **Header is `x-api-key`**: Not `Authorization: Bearer` for the V1 API-key requirement. This is the single most common auth mistake.
- **Single-release requires ALL milestones approved before any release**: You cannot call release-funds until every milestone is individually approved. Multi-release allows per-milestone releases.
- **Dispute distribution rules differ by escrow type**: Single-release `resolve-dispute` distributions must sum **exactly** to the current escrow balance. Multi-release `resolve-milestone-dispute` distributions must be positive, must not exceed that milestone's amount, and must not exceed the contract balance — they do **not** have to equal the full balance.
- **Fees are deducted from the escrow amount at release, not funded upfront**: `platformFee` is a fee-rate configuration, not an extra amount to deposit. At release the contract computes the platform fee and the 0.3% Trustless Work protocol fee (mainnet) from the configured release amount and sends the remainder to the receiver.
- **After funding, existing escrow state is frozen and only new milestones can be appended**: Roles, configured amounts, platform fee, and existing milestones cannot be changed once the escrow has funds. Existing approved milestones do not by themselves prevent appending new unapproved milestones.
- **`trustline.address` is always the issuer address (starts with G), never the escrow Soroban contract address** in the V1 API payload shape described by this skill. USDC Testnet: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` — USDC Mainnet: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`.
- **Trustlines are needed to hold or receive the asset**: The depositor needs the trustline to fund, and every address that will receive tokens (receiver(s), platformAddress for fees, dispute-distribution addresses) needs it before funds reach them. Authority-only signatures don't require holding the asset. Read [skills/api/trustlines.md](skills/api/trustlines.md) if trustline errors occur.
- **Role addresses may intentionally overlap**: V1 permits the same address to hold multiple roles. Its effective authority is the combination of those role assignments, except explicit contract prohibitions (for example, an address assigned as `disputeResolver` cannot raise a dispute). Use separate addresses when the product requires separation of duties; it is not a contract requirement.
- **React SDK: `useSendTransaction` is required after every write hook**: Hooks return an unsigned XDR only. You must sign it and call `sendTransaction` — without this, nothing reaches the blockchain.
- **React SDK: the `type` parameter must match the payload type**: `"single-release"` expects `SingleRelease*Payload`; `"multi-release"` expects `MultiRelease*Payload`. Mismatching causes runtime errors.
- **Use `validateOnChain=true` when querying before critical operations**: Without it you may receive stale cached data. Always use it before release, dispute, or resolve calls.
- **`engagementId` is an external reference, not a global uniqueness key**: Integrators can use it to link an escrow to their own contract, sale, invoice, order, grant, or serial number. V1 does not enforce global uniqueness of this field.

## Reference Files

Load these on demand — only when the task requires them:

### Platform Laws
- Read **[constitution.md](constitution.md)** before designing any escrow flow or answering questions about what a role can or cannot do — the universal laws, the version-selection rule, API and network rules, with each statement tagged ENFORCED / CANONICAL / SECURITY / FACT and a source-of-truth hierarchy on top.

### Protocol Profiles
- Read **[skills/protocol/v1.md](skills/protocol/v1.md)** for roles, lifecycle, payload rules and economics — **the default for every integration**.
- Read **[skills/protocol/v2.md](skills/protocol/v2.md)** only when the user explicitly asks for V2 or beta behavior.

### REST API
- Read **[skills/api/core-concepts.md](skills/api/core-concepts.md)** for roles, lifecycle, flags, and auth details.
- Read **[skills/api/types.md](skills/api/types.md)** when you need TypeScript type definitions for payloads, responses, or errors.
- Read **[skills/api/single-release-escrow.md](skills/api/single-release-escrow.md)** when implementing any single-release endpoint (deploy, fund, approve, release, dispute, resolve, update).
- Read **[skills/api/multi-release-escrow.md](skills/api/multi-release-escrow.md)** when implementing any multi-release endpoint.
- Read **[skills/api/trustlines.md](skills/api/trustlines.md)** when trustline errors occur, when setting up new accounts, or when the user asks about tokens/assets.

### REST API — V2 (beta, testnet only)
- Read **[skills/api/v2/core-concepts.md](skills/api/v2/core-concepts.md)** first for the v2 role model, trustline forms, type rules and what changed from V1.
- Read **[skills/api/v2/single-release.md](skills/api/v2/single-release.md)** when implementing any single-release v2 endpoint.
- Read **[skills/api/v2/multi-release.md](skills/api/v2/multi-release.md)** when implementing any multi-release v2 endpoint.

### React SDK — V2 (beta, testnet only)
- Read **[skills/react-sdk/v2/react-sdk.md](skills/react-sdk/v2/react-sdk.md)** when integrating `@trustless-work/escrow` 5.x: provider setup, the build/sign/submit loop, every hook, and the new GraphQL hooks.

### JavaScript SDK — V2 (beta)
- Read **[skills/js-sdk/js-sdk.md](skills/js-sdk/js-sdk.md)** when the integration is **not** React — Node, NestJS, Angular, browser, scripts. `@trustless-work/escrow-js` is framework-agnostic, zero-dependency, and V2-only.

### React SDK
- Read **[skills/react-sdk/react-sdk.md](skills/react-sdk/react-sdk.md)** for SDK setup, provider config, and hook overview.
- Read **[skills/react-sdk/hooks-reference.md](skills/react-sdk/hooks-reference.md)** for complete parameter docs and examples of any specific hook (`useInitializeEscrow`, `useFundEscrow`, `useApproveMilestone`, `useReleaseFunds`, `useStartDispute`, `useResolveDispute`, `useUpdateEscrow`, `useChangeMilestoneStatus`, `useWithdrawRemainingFunds`, `useSendTransaction`).
- Read **[skills/react-sdk/vibe-coding.md](skills/react-sdk/vibe-coding.md)** when scaffolding a full React/Next.js integration from scratch (contains global rules, step-by-step guides, and AI workflow context).

### Blocks SDK (pre-built UI)
- Read **[skills/blocks/introduction.md](skills/blocks/introduction.md)** for installation and SDK overview.
- Read **[skills/blocks/vibe-coding.md](skills/blocks/vibe-coding.md)** when scaffolding a Blocks integration from scratch.
- Read **[skills/blocks/components.md](skills/blocks/components.md)** for available UI components.
- Read **[skills/blocks/providers.md](skills/blocks/providers.md)** for provider setup and context API.
- Read **[skills/blocks/hooks.md](skills/blocks/hooks.md)** for TanStack Query hooks.

## API Base URLs

- **Mainnet**: `https://api.trustlesswork.com`
- **Testnet**: `https://dev.api.trustlesswork.com`
- **Swagger (Mainnet)**: `https://api.trustlesswork.com/docs`
- **Swagger (Testnet)**: `https://dev.api.trustlesswork.com/docs`

All endpoints require: `x-api-key: YOUR_API_KEY` header

Rate limit: **50 requests per 60 seconds**

## Common Transaction Flow

1. Call API endpoint → Get unsigned XDR transaction
2. Sign with the signer authorized for that operation → Create signed XDR
3. Submit via `/helper/send-transaction` → Broadcast to Stellar
4. Verify on-chain → Query with `validateOnChain=true`

## MCP Integration

Pair this skill with the Trustless Work MCP servers for live documentation and escrow operations. Setup guide: https://docs.trustlesswork.com/trustless-work/ai/mcp

Add both servers to `mcp.json` in the project root (Cursor → Settings → MCP → Add New MCP Server):

```json
{
  "mcpServers": {
    "trustlesswork-docs": {
      "type": "streamable-http",
      "url": "https://docs.trustlesswork.com/trustless-work/~gitbook/mcp",
      "headers": {}
    },
    "trustlesswork": {
      "type": "streamable-http",
      "url": "https://mcp.trustlesswork.com/mcp",
      "headers": {}
    }
  }
}
```

| Server | When to use |
| --- | --- |
| `trustlesswork-docs` | Search docs, answer questions, generate SDK code when local reference files are insufficient |
| `trustlesswork` | Trigger escrow actions and live operations from the editor |

**Docs MCP tools** (use in Agent Mode when reference files don't cover a topic):
- `mcp__trustless-work__searchDocumentation` — search documentation for any topic
- `mcp__trustless-work__getPage` — retrieve a specific documentation page

Prefer local reference files in `skills/` first; fall back to MCP when you need the latest docs or a topic not covered here.

If MCP tools are unavailable, remind the user to install both servers, enable Agent Mode, and confirm **Connected** status under Settings → MCP.

## Resources

- [Trustless Work Documentation](https://docs.trustlesswork.com)
- [MCP Setup Guide](https://docs.trustlesswork.com/trustless-work/ai/mcp)
- [Backoffice](https://dapp.trustlesswork.com)
- [Escrow Lab](https://demo.trustlesswork.com)
- [Escrow Blocks](https://blocks.trustlesswork.com/blocks)
- [Swagger (Mainnet)](https://api.trustlesswork.com/docs)