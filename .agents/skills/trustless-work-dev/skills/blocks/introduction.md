# Blocks SDK Introduction

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on mainnet. The V2 Core API is documented in [skills/api/v2/](../api/v2/), but the V2 React SDK is documented in [skills/react-sdk/v2/](../../skills/react-sdk/v2/react-sdk.md); the V2 Blocks surface is **not** documented yet. For the contract-level differences see [constitution.md](../../constitution.md).

The Trustless Work Blocks SDK (`@trustless-work/blocks`) provides pre-built UI components, providers, and TanStack Query hooks for quickly building escrow management interfaces.

## What You Get

- **UI Blocks**: Cards, tables, dialogs, forms to list and manage escrows
- **Providers**: API config, wallet context, dialogs, and amount formatting
- **TanStack Query Hooks**: For fetching and mutating escrows
- **Wallet-kit Integration**: Stellar wallet connectivity via `@creit.tech/stellar-wallets-kit`
- **Error Handling**: Built-in error handling utilities

## Dependencies

The Blocks SDK bundles or expects these libraries:

- `react-hook-form` — Form management
- `zod` — TypeScript-first schema validation
- `@trustless-work/escrow` — Core escrow SDK
- `@tanstack/react-query` — Data-fetching and caching
- `@tanstack/react-query-devtools` — React Query devtools
- `@hookform/resolvers` — Zod + react-hook-form integration
- `@creit.tech/stellar-wallets-kit` — Stellar wallet connection
- `axios` — HTTP client
- `@tanstack/react-table` — Headless table library
- `react-day-picker` — Date picker component
- `recharts` — Charting library

## Quick Setup (Recommended)

### 1. Install

```bash
npm install @trustless-work/blocks
```

### 2. Run the CLI Init

```bash
npx trustless-work init
```

**What `init` does:**
- Installs `shadcn/ui` components (with interactive prompts)
- Installs all required dependencies (listed above)
- Creates `.twblocks.json` configuration file
- Optionally wires providers into `app/layout.tsx`

### 3. Set Environment Variable

```bash
# .env.local
NEXT_PUBLIC_API_KEY=your_api_key_here
```

> All API calls — including read-only indexer queries — require a valid API key. The deployed API returns `401 Unauthorized` without it.

### 4. Add Modules

```bash
# Core modules (run once)
npx trustless-work add wallet-kit
npx trustless-work add providers
npx trustless-work add tanstack
npx trustless-work add helpers
npx trustless-work add handle-errors

# Escrow lifecycle blocks
npx trustless-work add escrows/single-release
npx trustless-work add escrows/multi-release
npx trustless-work add escrows/single-multi-release

# Listings
npx trustless-work add escrows/escrows-by-role/cards
# optional:
# npx trustless-work add escrows/escrows-by-role/table
# npx trustless-work add escrows/escrows-by-signer/cards
# npx trustless-work add escrows/escrows-by-signer/table
```

### 5. Discover All Available Blocks

```bash
npx trustless-work list
```

## Provider Stack (Order is Critical)

```tsx
// app/layout.tsx
<ReactQueryClientProvider>
  <TrustlessWorkProvider>
    <WalletProvider>
      <EscrowProvider>
        <EscrowDialogsProvider>
          <EscrowAmountProvider>
            {children}
          </EscrowAmountProvider>
        </EscrowDialogsProvider>
      </EscrowProvider>
    </WalletProvider>
  </TrustlessWorkProvider>
</ReactQueryClientProvider>
```

See [providers.md](providers.md) for full setup details.

## Context API

The Blocks SDK uses a Context API for global escrow state management.

### EscrowContext

```tsx
import { useEscrowContext } from '@trustless-work/blocks';

function MyComponent() {
  const { selectedEscrow, setSelectedEscrow, updateEscrow } = useEscrowContext();
}
```

- `selectedEscrow`: Currently selected escrow
- `setSelectedEscrow`: Set the selected escrow (when clicking a card/row)
- `updateEscrow`: Update the selected escrow in context (after mutations)

### How It's Used

Endpoint hooks read from `selectedEscrow` to extract data like `contractId`, roles, etc. UI blocks use `setSelectedEscrow` to store the selected escrow when opening detail dialogs.

## First Page Example

```tsx
// app/page.tsx
"use client";

import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/dialog/InitializeEscrow";
import { EscrowsByRoleCards } from "@/components/tw-blocks/escrows/escrows-by-role/cards/EscrowsCards";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Trustless Work</h2>
        <WalletButton />
      </header>
      <div className="flex justify-end mb-4">
        <InitializeEscrowDialog />
      </div>
      <EscrowsByRoleCards />
    </div>
  );
}
```

## Customization

All blocks are fully customizable. After installation with `npx trustless-work add <module>`, edit the generated components in `components/tw-blocks/` however you want.

## Resources

- [Blocks Playground](https://blocks.trustlesswork.com/blocks)
- [GitHub Repository](https://github.com/Trustless-Work/react-library-trustless-work-blocks)
- [NPM Package](https://www.npmjs.com/package/@trustless-work/blocks)

## Next Steps

- See [components.md](components.md) for available UI components
- See [providers.md](providers.md) for provider setup
- See [hooks.md](hooks.md) for TanStack Query hooks
