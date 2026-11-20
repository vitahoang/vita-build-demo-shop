import Link from "next/link";
import { products } from "@/lib/products";
import { formatPrice } from "@/lib/pricing";
export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div>
          <h1>Kettle & Co.</h1>
          <p>Simple objects, made for the moments you make time for.</p>
        </div>
        <div className="hero-mark" aria-hidden="true">
          ☕
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Everyday favorites</h2>
          <p>Made to be used, kept, and enjoyed.</p>
        </div>
        <ul aria-label="Products" className="product-list">
          {products.map((p) => (
            <li key={p.id}>
              <Link className="product-link" href={`/products/${p.id}`}>
                <div className={`product-art ${p.tone}`} aria-hidden="true">
                  <span>{p.icon}</span>
                </div>
                <div className="product-copy">
                  <h3>{p.name}</h3>
                  <span>{formatPrice(p.price)}</span>
                </div>
                <p>{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
