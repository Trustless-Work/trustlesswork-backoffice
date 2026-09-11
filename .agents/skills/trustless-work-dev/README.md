<img width="1400" height="350" alt="banner" src="https://github.com/user-attachments/assets/5f06304f-e021-4fea-a4de-96738e613038" />

# Trustless Work Development Skill

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on mainnet. The V2 Core API is documented separately in [skills/api/v2/](skills/api/v2/); the V2 React SDK is documented in [skills/react-sdk/v2/](skills/react-sdk/v2/react-sdk.md); the V2 Blocks surface is **not** documented yet. For the contract-level differences see [constitution.md](constitution.md).

[View on skills.sh](https://www.skills.sh/trustless-work/trustlesswork-skill)

A comprehensive AI skill for developing with the Trustless Work platform - enabling escrow contracts, milestone-based payments, and dispute resolution on the Stellar blockchain.

## Installation

Install this skill using:

```bash
npx skills add trustless-work/trustlesswork-skill
```

Or manually:

```bash
git clone https://github.com/Trustless-Work/trustlesswork-skill.git
cp -r trustlesswork-skill ~/.cursor/skills/trustless-work-dev
```

## Structure

```
trustlesswork-skill/
├── SKILL.md                    # Main skill definition (required)
├── README.md                   # Project documentation
├── LICENSE                     # Apache-2.0 License
├── .gitignore                  # Git ignore file
└── skills/                     # Skill documentation
    ├── api/                    # REST API documentation
    │   ├── core-concepts.md    # Roles, lifecycle, flags, API authentication
    │   ├── types.md            # Complete TypeScript type definitions
    │   ├── single-release-escrow.md # Single-release escrow implementation guide
    │   ├── multi-release-escrow.md  # Multi-release escrow implementation guide
    │   └── trustlines.md       # Stellar trustline configuration
    ├── react-sdk/              # React SDK documentation
    │   ├── react-sdk.md        # React SDK overview and quick reference
    │   ├── hooks-reference.md  # Complete hooks documentation
    │   └── vibe-coding.md      # AI context guide with prompts
    └── blocks/                 # Blocks SDK documentation
        ├── introduction.md     # Blocks SDK overview and installation
        ├── vibe-coding.md      # AI context guide
        ├── components.md       # Available UI components
        ├── providers.md        # Provider setup and context API
        └── hooks.md            # TanStack Query hooks
```

## What This Skill Provides

This skill equips AI assistants with comprehensive knowledge of:

### REST API
- **Core Concepts**: Roles, escrow lifecycle, status flags, API authentication
- **TypeScript Types**: Complete type definitions for all payloads (13+ types), responses, and errors
- **Single-Release Escrows**: Deploy, complete milestones, approve, release, dispute, resolve
- **Multi-Release Escrows**: Incremental payments, per-milestone releases, withdraw remaining funds
- **Trustlines**: Stellar asset configuration, setup, and management

### React SDK
- **Custom Hooks**: `useInitializeEscrow`, `useFundEscrow`, `useApproveMilestone`, `useReleaseFunds`, `useStartDispute`, `useResolveDispute`, `useUpdateEscrow`, `useWithdrawRemainingFunds`, `useChangeMilestoneStatus`, `useSendTransaction`
- **TypeScript Types**: Complete type definitions for all payloads
- **Integration Examples**: Full React component examples
- **AI Context Guide**: Vibe coding guide with implementation prompts

### Blocks SDK
- **UI Components**: Pre-built cards, tables, dialogs, forms for escrow management
- **Providers**: API config, wallet context, dialogs, amount formatting
- **TanStack Query Hooks**: For fetching and mutating escrows
- **Context API**: Global escrow state management
- **AI Context Guide**: Vibe coding guide with project bootstrap

## Use Cases

This skill is automatically applied when working on:

- Escrow or milestone-based payment systems
- Trustless Work API integration
- Stellar blockchain and Soroban smart contracts
- Conditional payment workflows
- Dispute resolution systems
- Freelancing or gig economy platforms
- Building React/Next.js escrow interfaces

## Quick Reference

### REST API Endpoints

**Single-Release Escrow**
- Deploy: `POST /deployer/single-release`
- Fund: `POST /escrow/single-release/fund-escrow`
- Change Status: `POST /escrow/single-release/change-milestone-status`
- Approve: `POST /escrow/single-release/approve-milestone`
- Release: `POST /escrow/single-release/release-funds`
- Dispute: `POST /escrow/single-release/dispute-escrow`
- Resolve: `POST /escrow/single-release/resolve-dispute`
- Update: `PUT /escrow/single-release/update-escrow`

**Multi-Release Escrow**
- Deploy: `POST /deployer/multi-release`
- Fund: `POST /escrow/multi-release/fund-escrow`
- Change Status: `POST /escrow/multi-release/change-milestone-status`
- Approve: `POST /escrow/multi-release/approve-milestone`
- Release: `POST /escrow/multi-release/release-milestone-funds`
- Dispute: `POST /escrow/multi-release/dispute-escrow`
- Resolve: `POST /escrow/multi-release/resolve-dispute`
- Update: `PUT /escrow/multi-release/update-escrow`
- Withdraw: `POST /escrow/multi-release/withdraw-remaining-funds`

**Helpers**
- Query: `GET /helper/get-escrow-by-contract-ids`
- Query by Signer: `GET /helper/get-escrows-by-signer`
- Query by Role: `GET /helper/get-escrows-by-role`
- Set Trustline: `POST /helper/set-trustline`
- Submit: `POST /helper/send-transaction`

### React SDK Hooks

```tsx
import { 
  useInitializeEscrow,
  useFundEscrow,
  useApproveMilestone,
  useReleaseFunds,
  useStartDispute,
  useResolveDispute,
  useUpdateEscrow,
  useChangeMilestoneStatus,
  useWithdrawRemainingFunds,
  useSendTransaction
} from '@trustless-work/escrow/hooks';
```

### Blocks SDK

```bash
# Install blocks
npm install @trustless-work/blocks

# Initialize project (installs deps, wires providers)
npx trustless-work init

# List available blocks
npx trustless-work list

# Install specific block
npx trustless-work add escrows/escrows-by-signer/table
```

## Documentation Files

### Platform Laws
- **[constitution.md](constitution.md)** - The Trustless Work Constitution: compressed agent-facing summary of role permissions, lifecycle preconditions, API rules, fees, and network rules — each statement tagged as contract-ENFORCED, CANONICAL workflow, SECURITY practice, or versioned FACT, under an explicit source-of-truth hierarchy. Agents should read this before designing any escrow flow.

### REST API
- **[skills/api/core-concepts.md](skills/api/core-concepts.md)** - Overview, roles, lifecycle, API authentication, error handling
- **[skills/api/types.md](skills/api/types.md)** - Complete TypeScript type definitions for all payloads (13+ types), responses, and errors with usage examples
- **[skills/api/single-release-escrow.md](skills/api/single-release-escrow.md)** - Complete guide for single-release escrows with detailed REST API examples
- **[skills/api/multi-release-escrow.md](skills/api/multi-release-escrow.md)** - Complete guide for multi-release escrows with detailed REST API examples
- **[skills/api/trustlines.md](skills/api/trustlines.md)** - Stellar trustline setup, configuration, and best practices

### React SDK
- **[skills/react-sdk/react-sdk.md](skills/react-sdk/react-sdk.md)** - React SDK overview, setup, and quick reference
- **[skills/react-sdk/hooks-reference.md](skills/react-sdk/hooks-reference.md)** - Complete detailed documentation for all 10 hooks with full usage examples, parameters, return values, and complete code samples
- **[skills/react-sdk/vibe-coding.md](skills/react-sdk/vibe-coding.md)** - Single-file AI context guide with global development rules, implementation prompts for all hooks, and step-by-step feature guides (essential for AI workflows)

### Blocks SDK
- **[skills/blocks/introduction.md](skills/blocks/introduction.md)** - Blocks SDK overview, installation, and context API
- **[skills/blocks/vibe-coding.md](skills/blocks/vibe-coding.md)** - Single-file AI context guide with project bootstrap, provider order, CLI commands, examples, and troubleshooting (essential for AI workflows)
- **[skills/blocks/components.md](skills/blocks/components.md)** - Available UI components and usage examples
- **[skills/blocks/providers.md](skills/blocks/providers.md)** - Provider setup and configuration
- **[skills/blocks/hooks.md](skills/blocks/hooks.md)** - TanStack Query hooks for fetching and mutating escrows

## MCP Integration

For the best experience, pair this skill with the [Trustless Work MCP servers](https://docs.trustlesswork.com/trustless-work/ai/mcp). MCP lets your AI assistant read live documentation and trigger escrow workflows directly from the editor.

### Two servers

| Server | URL | Purpose |
| --- | --- | --- |
| `trustlesswork-docs` | `https://docs.trustlesswork.com/trustless-work/~gitbook/mcp` | Search and read Trustless Work documentation |
| `trustlesswork` | `https://mcp.trustlesswork.com/mcp` | Escrow tools and live operations |

Use the docs server for answers and code generation. Use the product server for escrow actions and live operations.

### Setup in Cursor

1. Open **Cursor → Settings → MCP → Tools/MCP**
2. Click **Add New MCP Server** (Cursor opens or creates `mcp.json`)
3. Paste the configuration below and save

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

4. Go to **Settings → MCP → MCP Servers** and confirm both show **Connected**
5. Open a new chat in **Agent Mode** and ask Cursor to work with Trustless Work

Example prompts:

- `Create a new multi-release escrow with the SDK.`
- `Generate code to call the changeMilestoneStatus endpoint.`
- `Show me how to sign a transaction for releaseFunds.`

### Troubleshooting

- Place `mcp.json` in your project root if the server does not appear
- URLs must have **no trailing slash** and `type` must be `streamable-http`
- Enable **Agent Mode** and reload Cursor if tools are not detected

Full setup guide with screenshots: [MCP documentation](https://docs.trustlesswork.com/trustless-work/ai/mcp)

## Resources

- [Trustless Work Documentation](https://docs.trustlesswork.com)
- [MCP Setup Guide](https://docs.trustlesswork.com/trustless-work/ai/mcp)
- [Backoffice](https://dapp.trustlesswork.com)
- [Escrow Lab](https://demo.trustlesswork.com)
- [Escrow Blocks](https://blocks.trustlesswork.com/blocks)
- [Swagger (Mainnet)](https://api.trustlesswork.com/docs)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)

## License

Apache-2.0
