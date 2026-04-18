"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";

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
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("₱", "").replace(",", ""));
    return sum + price * (item.quantity ?? 1);
  }, 0);

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: userId,
          user_email: userEmail,
          total_amount: total,
          status: "pending",
          name,
          address,
          phone,
          payment: payment === "gcash" ? `GCash (Ref: ${refNumber})` : "Cash on Delivery",
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
        img: item.img ?? null,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();
      setPlaced(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
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
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer'}}>🛒</span>
        </div>
      </header>

      <div className="checkout-layout">

        {placed ? (
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h2>Order Placed!</h2>
            <p>Thank you for your purchase 🌸</p>
            <p>We will contact you shortly to confirm your order.</p>
            <button onClick={() => router.push("/shop_now")}>Continue Shopping</button>
          </div>
        ) : (
          <div className="checkout-wrapper">

            {/* STEP INDICATOR */}
            <div className="steps">
              {["Order", "Delivery", "Payment", "Confirm"].map((label, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div className={`step ${step >= i + 1 ? "active" : ""}`}>
                    <span className="step-num">{i + 1}</span>
                    <span className="step-label">{label}</span>
                  </div>
                  {i < 3 && <div className="step-line" />}
                </div>
              ))}
            </div>

            {/* STEP 1: ORDER SUMMARY */}
            {step === 1 && (
              <div className="checkout-card">
                <h3>Order Summary</h3>
                <div className="order-items">
                  {cart.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name} <span className="item-qty">x{item.quantity ?? 1}</span></span>
                      <span className="item-price">₱{(parseFloat(item.price.replace('₱','')) * (item.quantity ?? 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <strong>₱{total.toFixed(2)}</strong>
                </div>
                <div className="btn-row">
                  <button className="back-btn" onClick={() => router.push('/cart')}>← Back to Cart</button>
                  <button className="next-btn" onClick={() => setStep(2)}>Next →</button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY */}
            {step === 2 && (
              <div className="checkout-card">
                <h3>Delivery Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button className="next-btn" onClick={() => setStep(3)} disabled={!name || !address || !phone}>Next →</button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="checkout-card">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label className={`payment-option ${payment === 'cod' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                    <div>
                      <p className="payment-title">💵 Cash on Delivery</p>
                      <p className="payment-desc">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label className={`payment-option ${payment === 'gcash' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="gcash" checked={payment === "gcash"} onChange={() => setPayment("gcash")} />
                    <div>
                      <p className="payment-title">📱 GCash</p>
                      <p className="payment-desc">Pay via GCash mobile wallet</p>
                    </div>
                  </label>
                </div>

                {payment === "gcash" && (
                  <div className="gcash-steps">
                    <h4>📱 GCash Payment Steps</h4>
                    <ol>
                      <li>Open your <strong>GCash app</strong></li>
                      <li>Tap <strong>Send Money</strong></li>
                      <li>Enter number: <strong>09XXXXXXXXX</strong></li>
                      <li>Enter amount: <strong>₱{total.toFixed(2)}</strong></li>
                      <li>Add note: <strong>Mae Little Loops Order</strong></li>
                      <li>Tap <strong>Send</strong> and screenshot receipt</li>
                      <li>Enter your <strong>Reference Number</strong> below</li>
                    </ol>
                    <div className="form-group" style={{marginTop:'12px'}}>
                      <label>GCash Reference Number</label>
                      <input type="text" placeholder="Enter reference number" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                  <button className="next-btn" onClick={() => setStep(4)} disabled={payment === "gcash" && !refNumber}>Next →</button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRM */}
            {step === 4 && (
              <div className="checkout-card">
                <h3>Confirm Order</h3>
                <div className="confirm-list">
                  <div className="confirm-row"><span>Name</span><span>{name}</span></div>
                  <div className="confirm-row"><span>Address</span><span>{address}</span></div>
                  <div className="confirm-row"><span>Phone</span><span>{phone}</span></div>
                  <div className="confirm-row"><span>Payment</span><span>{payment === "gcash" ? "GCash" : "Cash on Delivery"}</span></div>
                  {payment === "gcash" && <div className="confirm-row"><span>Ref #</span><span>{refNumber}</span></div>}
                  <div className="confirm-row total-row"><span>Total</span><strong>₱{total.toFixed(2)}</strong></div>
                </div>
                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(3)}>← Back</button>
                  <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>{loading ? "Placing Order..." : "Place Order"}</button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={70} height={70} style={{borderRadius:'12px'}} />
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col">
          <h3>Categories</h3>
          <a href="/bouquets">Bouquets</a>
          <a href="/keychain">Keychains</a>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>📧 maelittleloops@gmail.com</p>
          <p>📱 09XXXXXXXXX</p>
          <p>📍 Cebu City, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
