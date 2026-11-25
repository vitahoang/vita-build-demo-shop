export type PricedLine = { unitPrice: number; quantity: number };

/** Prices are integer cents. */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function lineTotal(line: PricedLine): number {
  return line.unitPrice * line.quantity;
}

export function cartTotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
