"use client";
import Link from "next/link";
import { useCart } from "./cart-context";
export function Header() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/">
          Kettle & Co.
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">Shop</Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            Cart <span className="cart-count">{count}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
