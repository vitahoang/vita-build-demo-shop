"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/cart-context";
export function AddToCart({ id }: { id: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <div className="purchase-actions">
      <button
        className="button primary"
        onClick={() => {
          add(id);
          setAdded(true);
        }}
      >
        Add to cart
      </button>
      {added && (
        <p role="status">
          Added to cart. <Link href="/cart">View cart</Link>
        </p>
      )}
    </div>
  );
}
