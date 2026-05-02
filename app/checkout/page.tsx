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
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("receipts").upload(fileName, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(data.path);
      setReceiptUrl(urlData.publicUrl);
    }
    setUploading(false);
  }
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
          receipt_url: receiptUrl ?? null,
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

      // Decrement stock for each ordered item
      for (const item of cart) {
        const qty = item.quantity ?? 1;
        const { data: product } = await supabase
          .from("products")
          .select("id, stock")
          .eq("name", item.name)
          .single();
        if (product && product.stock > 0) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, product.stock - qty) })
            .eq("id", product.id);
        }
      }

      // Clear cart
      await clearCart();

      // Send order confirmation email to customer
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userEmail,
          subject: "🌸 Order Confirmed — Mae Little Loops Studio",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
              <h2 style="color:#e91e8c;">Mae Little Loops Studio 🌸</h2>
              <p>Hi <strong>${name}</strong>, your order has been placed successfully!</p>
              <div style="background:#f9f0ff;border-radius:12px;padding:20px;margin:16px 0;">
                <h3 style="color:#c44dff;margin-bottom:12px;">Order Summary</h3>
                ${cart.map(item => `
                  <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3e5ff;font-size:14px;">
                    <span>${item.name} x${item.quantity ?? 1}</span>
                    <span style="color:#e91e8c;font-weight:700;">&#8369;${(parseFloat(item.price.replace('&#8369;','').replace(',','')) * (item.quantity ?? 1)).toFixed(2)}</span>
                  </div>
                `).join('')}
                <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:16px;font-weight:700;">
                  <span>Total</span>
                  <span style="color:#e91e8c;">&#8369;${total.toFixed(2)}</span>
                </div>
              </div>
              <div style="background:#fff0f5;border-radius:12px;padding:16px;margin-bottom:16px;font-size:14px;">
                <p><strong>Delivery to:</strong> ${address}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Payment:</strong> ${payment === "gcash" ? "GCash" : "Cash on Delivery"}</p>
              </div>
              <p style="color:#666;">We will contact you shortly to confirm your delivery. Thank you for shopping with us! 💕</p>
              <p style="color:#aaa;font-size:12px;margin-top:16px;">Questions? Message us on Facebook or reply to this email.</p>
            </div>
          `,
        }),
      });

      // Send admin notification email
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "gulpanjoy@gmail.com",
          subject: "🛍️ New Order Received — Mae Little Loops Studio",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
              <h2 style="color:#e91e8c;">New Order Received! 🛍️</h2>
              <div style="background:#fce4ec;border-radius:12px;padding:20px;margin:16px 0;">
                <p><strong>Customer:</strong> ${userEmail}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Payment:</strong> ${payment === "gcash" ? "GCash" : "Cash on Delivery"}</p>
                <p><strong>Total:</strong> &#8369;${total.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <h3 style="color:#c44dff;">Items Ordered:</h3>
              ${cart.map(item => `
                <div style="padding:6px 0;border-bottom:1px solid #fce4ec;font-size:14px;">
                  ${item.name} x${item.quantity ?? 1} — &#8369;${(parseFloat(item.price.replace('&#8369;','').replace(',','')) * (item.quantity ?? 1)).toFixed(2)}
                </div>
              `).join('')}
              <p style="margin-top:16px;">Please check the admin dashboard to process this order.</p>
            </div>
          `,
        }),
      });

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
        <div className="nav-right">
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer', color:'white'}}>🛒</span>
        </div>
      </header>

      <div className="checkout-layout">

        {placed ? (
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h2>Order Placed!</h2>
            <p>Thank you for your purchase 🌸</p>
            <p>A confirmation email has been sent to <strong>{userEmail}</strong></p>
            <p style={{fontSize:'13px',color:'#aaa',marginTop:'4px'}}>We will contact you shortly to confirm your order.</p>
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
                  <label htmlFor="checkout-name">Full Name</label>
                  <input id="checkout-name" name="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-address">Address</label>
                  <input id="checkout-address" name="address" type="text" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-phone">Phone Number</label>
                  <input id="checkout-phone" name="phone" type="text" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
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

                    <div className="gcash-qr">
                      <img src="/gcash-qr.png" alt="GCash QR Code" className="qr-img" />
                      <p className="qr-label">Pay via GCash</p>
                    </div>

                    <ol>
                      <li>Scan the QR code using your <strong>GCash app</strong> to complete your payment.</li>
                      <li>Enter amount: <strong>₱{total.toFixed(2)}</strong></li>
                      <li>Add note: <strong>Mae Little Loops Order</strong></li>
                      <li>After payment, take a <strong>screenshot</strong> of your GCash receipt.</li>
                      <li>Upload your <strong>proof of payment</strong> below before confirming your order.</li>
                    </ol>

                    <div className="form-group" style={{marginTop:'16px'}}>
                      <label htmlFor="gcash-receipt">Upload GCash Receipt *</label>
                      <input
                        id="gcash-receipt"
                        name="gcash-receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="receipt-upload"
                      />
                      {uploading && <p className="upload-status">Uploading...</p>}
                      {receiptUrl && (
                        <div className="receipt-preview">
                          <p className="upload-status success">✅ Receipt uploaded!</p>
                          <img src={receiptUrl} alt="Receipt" style={{width:'120px', borderRadius:'8px', marginTop:'8px'}} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                  <button className="next-btn" onClick={() => setStep(4)} disabled={payment === "gcash" && !receiptUrl}>Next →</button>
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
          <p>📧 masarquemae65@gmail.com</p>
          <p>📱 09706383306</p>
          <p>📍 Masbate, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
