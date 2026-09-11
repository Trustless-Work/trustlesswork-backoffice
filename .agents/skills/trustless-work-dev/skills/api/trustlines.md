# Trustlines

> **Applies to both protocol versions.** Trustlines are a Stellar network requirement, independent of the Trustless Work protocol version.

Trustlines are required for accounts to hold and transact with non-native assets (anything other than XLM) on the Stellar network.

## What is a Trustline?

A trustline is an explicit opt-in configuration that authorizes a Stellar account to:
- Hold a specific asset
- Receive that asset
- Transact with that asset

**Without a trustline, an account cannot receive or hold tokens like USDC, EURC, or any other Stellar asset.**

## Trustline Requirements

- **Base reserve**: Each trustline adds to the account's XLM base reserve — currently 0.5 XLM. This is a Stellar network parameter (it can change via network vote), not a Trustless Work constant
- **Prevents abuse**: Limits spam and unauthorized asset creation
- **Trust limit**: Maximum amount the account is willing to hold

## Common Assets

### USDC (Circle)

The `address` field is always the **issuer address (starts with G)**, not the Soroban contract address (starts with C). The API resolves the Soroban contract internally from the issuer + symbol.

```typescript
// Testnet issuer
{
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  symbol: "USDC",
  decimals: 7
}

// Mainnet issuer
{
  address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  symbol: "USDC",
  decimals: 7
}
```

### EURC (Circle)

```typescript
// Mainnet (same on testnet)
{
  address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
  symbol: "EURC",
  decimals: 7
}
```

> **Important**: Always use the testnet address when testing on `dev.api.trustlesswork.com` and the mainnet address when using `api.trustlesswork.com`. Using the wrong address will cause funding failures.

## Trustline Configuration in Escrows

When deploying an escrow, specify the trustline in the payload:

```json
{
  "trustline": {
    "address": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    "symbol": "USDC"
  }
}
```

## Setting Up Trustlines via API

### Using the `/helper/set-trustline` Endpoint

The API provides a helper endpoint to set trustlines programmatically:

**Endpoint:** `POST /helper/set-trustline`

This endpoint generates an unsigned XDR to establish a trustline. Follow the standard transaction pattern: get unsigned XDR → sign → submit via `/helper/send-transaction`.

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

export const setTrustline = async (address: string, assetAddress: string) => {
  const response = await http.post("/helper/set-trustline", {
    address,        // Stellar account address
    assetAddress,   // Token issuer address
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

### Before Deploying Escrow

All parties involved in an escrow must have trustlines established:

1. **Payer / Depositor**: Must have trustline to fund escrow
2. **Service Provider / Receiver**: Must have trustline to receive payments
3. **Platform Address**: Should have trustline for fee receipt

### Using Stellar SDK

```typescript
import { Horizon, Asset, TransactionBuilder, Operation, Networks } from '@stellar/stellar-sdk';

async function establishTrustline(accountAddress: string, assetCode: string, issuer: string) {
  const server = new Horizon.Server('https://horizon.stellar.org');
  const account = await server.loadAccount(accountAddress);

  const asset = new Asset(assetCode, issuer);
  
  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.PUBLIC
  })
    .addOperation(
      Operation.changeTrust({
        asset: asset,
        limit: '922337203685.4775807' // Max int64
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit transaction
}
```

## TypeScript Constants

```typescript
export const TRUSTLINES = {
  USDC_TESTNET: {
    address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    symbol: "USDC",
    decimals: 7,
  },
  USDC_MAINNET: {
    address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    symbol: "USDC",
    decimals: 7,
  },
  EURC: {
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    symbol: "EURC",
    decimals: 7,
  },
};

// Use in escrow deployment
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === "testnet";
const usdcTrustline = isTestnet ? TRUSTLINES.USDC_TESTNET : TRUSTLINES.USDC_MAINNET;
```

## Amount Handling

Stellar assets use 7 decimals. The Trustless Work API accepts all `amount` values as **numbers** (not raw stroops, not strings) — across every endpoint, including `fund-escrow`. The string conversions below only apply when talking directly to Stellar/Horizon:

```typescript
// Human-readable: 100.50 USDC
// Raw Stellar stroops: 1005000000 (multiply by 10^7)

function toStellarAmount(amount: number): string {
  return (amount * Math.pow(10, 7)).toString();
}

function fromStellarAmount(amount: string): number {
  return parseInt(amount) / Math.pow(10, 7);
}
```

## Checking Trustline Status

```typescript
import { Horizon } from '@stellar/stellar-sdk';

async function checkTrustline(accountAddress: string, assetCode: string, issuer: string) {
  const server = new Horizon.Server('https://horizon.stellar.org');
  const account = await server.loadAccount(accountAddress);
  
  const trustline = account.balances.find(
    balance => balance.asset_code === assetCode && balance.asset_issuer === issuer
  );

  return {
    exists: !!trustline,
    balance: trustline?.balance || '0',
    limit: trustline?.limit || '0'
  };
}
```

## Common Issues

### "Asset Not Found" Error
- **Cause**: Account doesn't have trustline for the asset
- **Solution**: Establish trustline before attempting to receive/hold asset

### "Insufficient Balance" Error
- **Cause**: Account doesn't have enough XLM for trustline reserve (0.5 XLM)
- **Solution**: Fund account with at least 0.5 XLM + transaction fees

### Wrong Network Address
- **Cause**: Using mainnet USDC address on testnet or vice versa
- **Solution**: Use `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` for testnet USDC

## Best Practices

1. **Establish trustlines early**: Set up trustlines before escrow deployment
2. **Verify trustlines**: Check that all parties have required trustlines
3. **Distinguish testnet/mainnet**: Use correct addresses per network
4. **Use `/helper/set-trustline`**: Simplifies trustline setup for users
5. **Test on testnet**: Always verify trustline setup on testnet first
