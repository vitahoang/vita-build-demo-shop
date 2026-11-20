"use client";
import Link from "next/link";
import { useCart } from "../cart-context";
import { getProduct } from "@/lib/products";
import { cartTotal, formatPrice, lineTotal } from "@/lib/pricing";
export default function CartPage() {
  const { lines, change } = useCart();
  const priced = lines.flatMap((line) => {
    const product = getProduct(line.id);
    return product ? [{ ...line, product }] : [];
  });
  const total = cartTotal(
    priced.map((x) => ({ unitPrice: x.product.price, quantity: x.quantity })),
  );
  return (
    <main className="container narrow-page">
      <h1>Your cart</h1>
      {!priced.length ? (
        <div className="empty-state">
          <p>Your cart is empty. Find something for your everyday.</p>
          <Link className="button primary" href="/">
            Shop products
          </Link>
        </div>
      ) : (
        <>
          <ul aria-label="Cart items" className="cart-lines">
            {priced.map(({ id, quantity, product: p }) => (
              <li className="cart-line" key={id}>
                <div
                  className={`product-art cart-art ${p.tone}`}
                  aria-hidden="true"
                >
                  <span>{p.icon}</span>
                </div>
                <div className="cart-item-copy">
                  <Link href={`/products/${id}`}>{p.name}</Link>
                  <p>{formatPrice(p.price)} each</p>
                  <div className="stepper">
                    <button
                      aria-label={`Decrease ${p.name} quantity`}
                      onClick={() => change(id, quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      aria-label={`${p.name} quantity`}
                      value={quantity}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isInteger(n) && n > 0) change(id, n);
                      }}
                    />
                    <button
                      aria-label={`Increase ${p.name} quantity`}
                      onClick={() => change(id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <strong className="line-price">
                  {formatPrice(lineTotal({ unitPrice: p.price, quantity }))}
                </strong>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <div>
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p>Shipping is calculated at checkout.</p>
            <Link className="button primary" href="/checkout">
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
