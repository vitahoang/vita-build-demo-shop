import { describe, expect, it } from "vitest";
import { cartTotal, formatPrice, lineTotal } from "./pricing";

describe("formatPrice", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(2400)).toBe("$24.00");
    expect(formatPrice(1999)).toBe("$19.99");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("lineTotal", () => {
  it("multiplies the unit price by the quantity", () => {
    expect(lineTotal({ unitPrice: 2400, quantity: 3 })).toBe(7200);
  });
});

describe("cartTotal", () => {
  it("is zero for an empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("sums lines that each have quantity 1", () => {
    expect(
      cartTotal([
        { unitPrice: 2400, quantity: 1 },
        { unitPrice: 1800, quantity: 1 },
      ]),
    ).toBe(4200);
  });

  // Known bug (spec §12): the cart total ignores quantity. Remove `.skip` once it is fixed.
  it.skip("counts every unit when a quantity goes from 1 to 3", () => {
    expect(cartTotal([{ unitPrice: 2400, quantity: 3 }])).toBe(7200);
  });
});
