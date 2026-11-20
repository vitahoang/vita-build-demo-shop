import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import { formatPrice } from "@/lib/pricing";
import { AddToCart } from "./purchase";
export function generateStaticParams() {
  return products.map(({ id }) => ({ id }));
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();
  return (
    <main className="container product-page">
      <Link className="back-link" href="/">
        All products
      </Link>
      <div className="product-detail">
        <div className={`product-art detail-art ${p.tone}`} aria-hidden="true">
          <span>{p.icon}</span>
        </div>
        <div className="detail-copy">
          <h1>{p.name}</h1>
          <p className="detail-price">{formatPrice(p.price)}</p>
          <p>{p.description}</p>
          <AddToCart id={p.id} />
        </div>
      </div>
    </main>
  );
}
