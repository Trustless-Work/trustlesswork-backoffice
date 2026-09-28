export function readEscrowWireAmount(row: object): string | number | null {
  if (!("amount" in row)) {
    return null;
  }

  const value = row.amount;
  if (value === null) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}
