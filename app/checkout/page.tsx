"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [placed, setPlaced] = useState(false);

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("₱", "").replace(",", ""));
    return sum + price * (item.quantity ?? 1);
  }, 0);

  function handlePlaceOrder() {
    clearCart();
    setPlaced(true);
  }

  return (
    <main className="checkout-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer'}}>🛒</span>
        </div>
      </header>

      <section className="checkout-content">
        <h2 className="checkout-title">🧾 Checkout</h2>

        {placed ? (
          <div className="order-success">
            <p>✅ Order placed successfully!</p>
            <p>Thank you for your purchase 🌸</p>
            <button onClick={() => router.push("/shop_now")}>CONTINUE SHOPPING</button>
          </div>
        ) : (
          <>
            {/* ORDER SUMMARY */}
            <div className="checkout-card">
              <h3>Order Summary</h3>
              {cart.map((item, index) => (
                <div key={index} className="checkout-item">
                  <span>{item.name} x{item.quantity ?? 1}</span>
                  <span>{item.price}</span>
                </div>
              ))}
              <div className="checkout-total">
                <strong>Total: ₱{total.toFixed(2)}</strong>
              </div>
            </div>

            {/* DELIVERY INFO */}
            <div className="checkout-card">
              <h3>Delivery Information</h3>
              <input type="text" placeholder="Full Name" />
              <input type="text" placeholder="Address" />
              <input type="text" placeholder="Phone Number" />
            </div>

            {/* PAYMENT */}
            <div className="checkout-card">
              <h3>Payment Method</h3>
              <label><input type="radio" name="payment" defaultChecked /> Cash on Delivery</label>
              <label><input type="radio" name="payment" /> GCash</label>
            </div>

            <button className="place-order-btn" onClick={handlePlaceOrder}>
              PLACE ORDER
            </button>
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
