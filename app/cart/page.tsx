"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("₱", "").replace(",", ""));
    return sum + price * (item.quantity ?? 1);
  }, 0);

  return (
    <main className="cart-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
            }}
          />
          <a href="/login" className="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          <div className="cart-icon-wrapper" onClick={() => router.push("/cart")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cart.length > 0 && (
              <span className="cart-badge">{cart.length}</span>
            )}
          </div>
        </div>
      </header>

      <section className="cart-content">
        <h2 className="cart-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff1493" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", verticalAlign: "middle" }}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button onClick={() => router.push("/bouquets")}>SHOP NOW</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-img">
                    {item.img ? (
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={70}
                        height={70}
                        style={{ borderRadius: "10px", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "28px" }}>🌸</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{item.price}</p>
                  </div>
                  <p className="cart-item-qty">
                    Qty: <br /> {item.quantity ?? 1}
                  </p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary-card">
              <p className="cart-total">
                Total: <strong>₱{total.toFixed(2)}</strong>
              </p>
              <div className="cart-actions">
                <button className="clear-btn" onClick={clearCart}>
                  CLEAR CART
                </button>
                <button
                  className="checkout-btn"
                  onClick={() => alert("Checkout coming soon!")}
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <footer>
        <h2>Mae Little Loops Studio</h2>
        <div>
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
        </div>
      </footer>

    </main>
  );
}