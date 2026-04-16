"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("cod");
  const [placed, setPlaced] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

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
            {/* STEP INDICATOR */}
            <div className="steps">
              <div className={`step ${step >= 1 ? "active" : ""}`}>1. Order</div>
              <div className="step-line" />
              <div className={`step ${step >= 2 ? "active" : ""}`}>2. Delivery</div>
              <div className="step-line" />
              <div className={`step ${step >= 3 ? "active" : ""}`}>3. Payment</div>
              <div className="step-line" />
              <div className={`step ${step >= 4 ? "active" : ""}`}>4. Confirm</div>
            </div>

            {/* STEP 1: ORDER SUMMARY */}
            {step === 1 && (
              <div className="checkout-card">
                <h3>🛒 Order Summary</h3>
                {cart.map((item, index) => (
                  <div key={index} className="checkout-item">
                    <span>{item.name} x{item.quantity ?? 1}</span>
                    <span>{item.price}</span>
                  </div>
                ))}
                <div className="checkout-total">
                  <strong>Total: ₱{total.toFixed(2)}</strong>
                </div>
                <button className="next-btn" onClick={() => setStep(2)}>NEXT →</button>
              </div>
            )}

            {/* STEP 2: DELIVERY */}
            {step === 2 && (
              <div className="checkout-card">
                <h3>📦 Delivery Information</h3>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(1)}>← BACK</button>
                  <button className="next-btn" onClick={() => setStep(3)} disabled={!name || !address || !phone}>NEXT →</button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="checkout-card">
                <h3>💳 Payment Method</h3>
                <label className="radio-label">
                  <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  Cash on Delivery
                </label>
                <label className="radio-label">
                  <input type="radio" name="payment" value="gcash" checked={payment === "gcash"} onChange={() => setPayment("gcash")} />
                  GCash
                </label>

                {payment === "gcash" && (
                  <div className="gcash-steps">
                    <h4>📱 GCash Payment Steps:</h4>
                    <ol>
                      <li>Open your <strong>GCash app</strong></li>
                      <li>Tap <strong>Send Money</strong></li>
                      <li>Enter GCash number: <strong>09XXXXXXXXX</strong></li>
                      <li>Enter amount: <strong>₱{total.toFixed(2)}</strong></li>
                      <li>Add note: <strong>Mae Little Loops Order</strong></li>
                      <li>Tap <strong>Send</strong> and screenshot your receipt</li>
                      <li>Enter your <strong>Reference Number</strong> below</li>
                    </ol>
                    <input
                      type="text"
                      placeholder="GCash Reference Number"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(2)}>← BACK</button>
                  <button
                    className="next-btn"
                    onClick={() => setStep(4)}
                    disabled={payment === "gcash" && !refNumber}
                  >NEXT →</button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRM */}
            {step === 4 && (
              <div className="checkout-card">
                <h3>✅ Order Confirmation</h3>
                <div className="confirm-row"><span>Name:</span><span>{name}</span></div>
                <div className="confirm-row"><span>Address:</span><span>{address}</span></div>
                <div className="confirm-row"><span>Phone:</span><span>{phone}</span></div>
                <div className="confirm-row"><span>Payment:</span><span>{payment === "gcash" ? "GCash" : "Cash on Delivery"}</span></div>
                {payment === "gcash" && <div className="confirm-row"><span>Ref #:</span><span>{refNumber}</span></div>}
                <div className="confirm-row"><span>Total:</span><span><strong>₱{total.toFixed(2)}</strong></span></div>
                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(3)}>← BACK</button>
                  <button className="place-order-btn" onClick={handlePlaceOrder}>PLACE ORDER</button>
                </div>
              </div>
            )}
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
