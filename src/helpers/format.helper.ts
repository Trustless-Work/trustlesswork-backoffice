/**
 * Format the currency
 *
 * @param value - The value
 * @param currency - The currency
 * @returns The formatted currency
 */
export const formatCurrency = (value: number, currency: string) => {
  return `${currency} ${value.toFixed(2)}`;
};

/**
 * Format a numeric asset amount for display (no symbol).
 */
export function formatAssetAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * @deprecated Use formatAssetAmount
 */
export function formatUsdcAmount(amount: number): string {
  return formatAssetAmount(amount);
}

export function isUsdcSymbol(symbol: string): boolean {
  return symbol.trim().toUpperCase() === "USDC";
}

export function isUsdtSymbol(symbol: string): boolean {
  const normalized = symbol.trim().toUpperCase();
  return normalized === "USDT" || normalized === "USDT0";
}

export function isXlmSymbol(symbol: string): boolean {
  const normalized = symbol.trim().toLowerCase();
  return normalized === "xlm" || normalized === "native";
}

/**
 * Format the timestamp
 *
 * @param ts - The timestamp
 * @returns The formatted timestamp
 */
export function formatTimestamp(ts?: {
  _seconds: number;
  _nanoseconds: number;
}) {
  if (!ts) return "-";
  const d = new Date(ts._seconds * 1000);
  return d.toLocaleString();
}

/**
 * Format the address
 *
 * @param address - The address
 * @returns The formatted address
 */
export function formatAddress(address: string, length: number = 10) {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Format the role
 *
 * @param role - The role
 * @returns The formatted role
 */
export function formatRole(role: string) {
  return role
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format the text
 *
 * @param text - The text
 * @returns The formatted text
 */
export function formatText(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Compact ISO date-time for narrow layouts (e.g. mobile cards).
 */
export function formatIsoDateTimeCompact(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format an ISO date-time string for display.
 */
export function formatIsoDateTime(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}
