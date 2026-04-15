"use client";

import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

export default function Page() {
  const { cart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => {
    const price = Number(item.price.replace("₱", ""));
    return sum + price;
  }, 0);

  return (
    <main className="cart-page">

      {/* HEADER */}
      <header className="header">
        <h1>Mae Little Loops Studio</h1>

        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/keychain">Keychain</a>
        </nav>

        <span className="cart-title">🛒 Cart</span>
      </header>

      {/* BODY */}
      <section className="cart-container">

        {cart.length === 0 ? (
          <p className="empty">Your cart is empty 🛒</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={index} className="cart-card">
                <h3>{item.name}</h3>
                <p>{item.price}</p>
              </div>
            ))}

            <div className="cart-summary">
              <h2>Total: ₱{total.toFixed(2)}</h2>

              <button onClick={() => router.push("/checkout")}>
                Checkout
              </button>
            </div>
          </>
        )}

      </section>
    </main>
  );
}