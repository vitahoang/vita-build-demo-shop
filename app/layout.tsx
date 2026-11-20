import type { Metadata } from "next";
import { CartProvider } from "./cart-context";
import { Header } from "./header";
import "./globals.css";
export const metadata: Metadata = {
  title: "Kettle & Co. | Everyday objects",
  description: "Thoughtful objects for everyday living.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
          <footer className="site-footer">
            Kettle & Co. <span>Good things for the everyday.</span>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
