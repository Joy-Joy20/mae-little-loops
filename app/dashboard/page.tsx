"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type Order = { id: string; created_at: string; total_amount: number; status: string; payment: string; address: string; };
type CartItem = { id: string; product_name: string; price: string; quantity: number; img: string | null; };

export default function Dashboard() {
  const router = useRouter();
  const { removeFromCart } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "cart">("profile");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? null);
      setUserId(user.id);

      // Fetch profile
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
      if (profile?.username) { setFullName(profile.username); setEditName(profile.username); }

      // Fetch orders
      const { data: orderData } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (orderData) setOrders(orderData);

      // Fetch cart
      const { data: cartData } = await supabase.from("cart").select("*").eq("user_id", user.id);
      if (cartData) setCartItems(cartData);

      setLoading(false);
    });
  }, [router]);

  async function handleSaveName() {
    if (!userId) return;
    setSavingName(true);
    await supabase.from("profiles").upsert({ id: userId, username: editName, email: userEmail });
    setFullName(editName);
    setEditing(false);
    setSavingName(false);
  }

  async function handleRemoveCartItem(cartId: string, index: number) {
    await supabase.from("cart").delete().eq("id", cartId);
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    removeFromCart(index);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/shop_now");
  }

  if (loading) return <div className="dash-loading">Loading...</div>;

  const tabs = [
    { key: "profile", label: "👤 Profile" },
    { key: "orders", label: "📦 My Orders" },
    { key: "cart", label: "🛒 My Cart" },
  ];

  return (
    <main className="dash-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard" className="active-link">Dashboard</a>
        </nav>
        <div className="nav-right">
          <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail?.split('@')[0]}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer', color:'white'}}>🛒</span>
        </div>
      </header>

      <div className="dash-content">

        {/* PROFILE HEADER */}
        <div className="dash-profile">
          <div className="dash-avatar">👤</div>
          <div>
            <h2 className="dash-name">{fullName || userEmail}</h2>
            <p className="dash-role">{userEmail}</p>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* TABS */}
        <div className="dash-tabs">
          {tabs.map((tab) => (
            <button key={tab.key} className={`dash-tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key as typeof activeTab)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="dash-card">
            <h3 className="dash-card-title">Profile Information</h3>
            <div className="dash-field">
              <label>Email</label>
              <p>{userEmail}</p>
            </div>
            <div className="dash-field">
              <label>Full Name</label>
              {editing ? (
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                  <input className="dash-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter your full name" />
                  <button className="dash-save-btn" onClick={handleSaveName} disabled={savingName}>{savingName ? "Saving..." : "Save"}</button>
                  <button className="dash-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <p>{fullName || "Not set"}</p>
                  <button className="dash-edit-btn" onClick={() => setEditing(true)}>Edit</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="dash-card">
            <h3 className="dash-card-title">Order History</h3>
            {orders.length === 0 ? (
              <div className="dash-empty">
                <p>No orders yet.</p>
                <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
              </div>
            ) : (
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr><th>Order ID</th><th>Total Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="dash-order-id">#{order.id.slice(0, 8)}...</td>
                        <td style={{fontWeight:'bold', color:'#f06292'}}>₱{order.total_amount?.toFixed(2)}</td>
                        <td><span className={`dash-status ${order.status}`}>{order.status}</span></td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CART TAB */}
        {activeTab === "cart" && (
          <div className="dash-card">
            <h3 className="dash-card-title">My Cart</h3>
            {cartItems.length === 0 ? (
              <div className="dash-empty">
                <p>Your cart is empty.</p>
                <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
              </div>
            ) : (
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity}</td>
                        <td style={{fontWeight:'bold', color:'#f06292'}}>
                          ₱{(parseFloat(item.price.replace('₱','').replace(',','')) * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button className="dash-remove-btn" onClick={() => handleRemoveCartItem(item.id, index)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{textAlign:'right', marginTop:'16px'}}>
                  <button className="dash-checkout-btn" onClick={() => router.push('/checkout')}>Proceed to Checkout</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <footer>
        <div className="footer-col"><h3>Mae Sister&apos;s Bouquet</h3><p>Handmade with love 🌸</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p></div>
      </footer>

    </main>
  );
}
