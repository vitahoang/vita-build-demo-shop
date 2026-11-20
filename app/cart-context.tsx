"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getProduct } from "@/lib/products";
type Line = { id: string; quantity: number };
type Cart = {
  lines: Line[];
  add: (id: string) => void;
  change: (id: string, quantity: number) => void;
  clear: () => void;
  count: number;
};
const Context = createContext<Cart | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Hydrate from localStorage after mount so server and first client render match.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("kettle-cart") || "[]");
      if (Array.isArray(saved))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLines(
          saved.filter(
            (x: Line) =>
              getProduct(x.id) &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          ),
        );
    } catch {
      localStorage.removeItem("kettle-cart");
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("kettle-cart", JSON.stringify(lines));
  }, [lines, loaded]);
  const add = (id: string) =>
    setLines((current) =>
      current.some((x) => x.id === id)
        ? current.map((x) =>
            x.id === id ? { ...x, quantity: x.quantity + 1 } : x,
          )
        : [...current, { id, quantity: 1 }],
    );
  const change = (id: string, quantity: number) =>
    setLines((current) =>
      quantity < 1
        ? current.filter((x) => x.id !== id)
        : current.map((x) => (x.id === id ? { ...x, quantity } : x)),
    );
  return (
    <Context.Provider
      value={{
        lines,
        add,
        change,
        clear: () => setLines([]),
        count: lines.reduce((n, x) => n + x.quantity, 0),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw Error("CartProvider is missing");
  return value;
}
