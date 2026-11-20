"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../cart-context";
import { getProduct } from "@/lib/products";
import { cartTotal, formatPrice } from "@/lib/pricing";
export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const [placed, setPlaced] = useState(false);
  const total = cartTotal(
    lines.flatMap((x) => {
      const p = getProduct(x.id);
      return p ? [{ unitPrice: p.price, quantity: x.quantity }] : [];
    }),
  );
  if (placed)
    return (
      <main className="container narrow-page confirmation">
        <div className="checkmark" aria-hidden="true">
          ✓
        </div>
        <h1>Order placed</h1>
        <p>
          Thanks for stopping by. This is a demo checkout, so no payment was
          taken.
        </p>
        <Link className="button primary" href="/">
          Continue shopping
        </Link>
      </main>
    );
  return (
    <main className="container narrow-page">
      <Link className="back-link" href="/cart">
        Back to cart
      </Link>
      <h1>Checkout</h1>
      {!lines.length ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link className="button primary" href="/">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              clear();
              setPlaced(true);
            }}
          >
            <h2>Contact</h2>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            <p>No payment details are needed for this demo.</p>
            <button className="button primary">Place order</button>
          </form>
          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <p>{lines.reduce((n, x) => n + x.quantity, 0)} items</p>
            <div>
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
