export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  tone: string;
};
export const products: Product[] = [
  {
    id: "stoneware-mug",
    name: "Stoneware mug",
    price: 2400,
    description:
      "A quiet start to the morning. Hand-finished stoneware with a soft glaze.",
    icon: "☕",
    tone: "clay",
  },
  {
    id: "linen-napkins",
    name: "Linen napkins",
    price: 1800,
    description: "Everyday linen, made to last. Set of two.",
    icon: "▧",
    tone: "linen",
  },
  {
    id: "glass-carafe",
    name: "Glass carafe",
    price: 3800,
    description: "Lightweight clear glass for the table.",
    icon: "◌",
    tone: "glass",
  },
  {
    id: "taper-candles",
    name: "Taper candles",
    price: 1600,
    description: "A little light for any evening. Set of two.",
    icon: "♢",
    tone: "candle",
  },
  {
    id: "oak-board",
    name: "Oak serving board",
    price: 4600,
    description: "Solid oak, softly rounded for sharing.",
    icon: "▱",
    tone: "oak",
  },
  {
    id: "cotton-throw",
    name: "Cotton throw",
    price: 5800,
    description: "A soft layer for slower days.",
    icon: "▤",
    tone: "cotton",
  },
];
export const getProduct = (id: string) => products.find((p) => p.id === id);
