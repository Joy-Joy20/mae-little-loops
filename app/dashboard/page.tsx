"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type OrderItem = { product_name: string; quantity: number; };
type Order = { id: string; created_at: string; total_amount: number; status: string; order_items: OrderItem[]; };
type CartItem = { id: string; product_name: string; price: string; quantity: number; img: string | null; };

export default function Dashboard() {
  const router = useRouter();
  const { removeFromCart } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [editName, setEditName] = useState("");
  const [phone, setPhone] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "cart">("profile");

  async function fetchOrders(uid: string) {
    const { data } = await supabase
      .from("orders")
      .select(`id, created_at, total_amount, status, order_items ( product_name, quantity )`)
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? null);
      setUserId(user.id);

      const { data: profile } = await supabase.from("users").select("username, phone, address").eq("id", user.id).single();
      if (profile?.username) { setFullName(profile.username); setEditName(profile.username); }
      if (profile?.phone) { setPhone(profile.phone); setEditPhone(profile.phone); }
      if (profile?.address) { setAddress(profile.address); setEditAddress(profile.address); }

      await fetchOrders(user.id);

      const { data: cartData } = await supabase.from("cart").select("*").eq("user_id", user.id);
      if (cartData) setCartItems(cartData);

      setLoading(false);
    });
  }, [router]);

  async function handleSaveName() {
    if (!userId) return;
    setSavingName(true);
    await supabase.from("users").upsert({ id: userId, username: editName, email: userEmail, phone: editPhone, address: editAddress });
    setFullName(editName);
    setPhone(editPhone);
    setAddress(editAddress);
    setEditing(false);
    setSavingName(false);
  }

  async function handleRemoveCartItem(cartId: string, index: number) {
    await supabase.from("cart").delete().eq("id", cartId);
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    removeFromCart(index);
  }

  async function handleCancel(orderId: string) {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) {
      alert("Failed to cancel order. Please try again.");
    } else {
      alert("Order cancelled successfully.");
      if (userId) fetchOrders(userId);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/shop_now");
  }

  if (loading) return (
    <main className="dash-page">
      <div className="dash-content">
        <div className="skeleton-card" style={{marginBottom:'24px', padding:'28px 32px', display:'flex', alignItems:'center', gap:'20px'}}>
          <div className="skeleton" style={{width:'60px', height:'60px', borderRadius:'50%', flexShrink:0}} />
          <div style={{flex:1}}>
            <div className="skeleton skeleton-line" style={{width:'40%'}} />
            <div className="skeleton skeleton-line" style={{width:'60%'}} />
          </div>
        </div>
        <div style={{display:'flex', gap:'10px', marginBottom:'24px'}}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{width:'120px', height:'40px', borderRadius:'50px'}} />)}
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-line" style={{width:'30%', marginBottom:'24px'}} />
          {[1,2,3].map(i => (
            <div key={i} style={{display:'flex', gap:'16px', marginBottom:'16px'}}>
              <div className="skeleton skeleton-line" style={{flex:1}} />
              <div className="skeleton skeleton-line" style={{flex:1}} />
              <div className="skeleton skeleton-line" style={{flex:1}} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );

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
          
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard" className="active-link">Profile</a>
        </nav>
        <div className="nav-right">
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if(q) router.push(`/search?q=${encodeURIComponent(q)}`); }}} />
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
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                  <input className="dash-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter your full name" />
                </div>
              ) : (
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <p>{fullName || "Not set"}</p>
                </div>
              )}
            </div>
            <div className="dash-field">
              <label>Phone Number</label>
              {editing ? (
                <input className="dash-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Enter your phone number" />
              ) : (
                <p>{phone || "Not set"}</p>
              )}
            </div>
            <div className="dash-field">
              <label>Address</label>
              {editing ? (
                <input className="dash-input" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter your address" />
              ) : (
                <p>{address || "Not set"}</p>
              )}
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
              {editing ? (
                <>
                  <button className="dash-save-btn" onClick={handleSaveName} disabled={savingName}>{savingName ? "Saving..." : "Save Changes"}</button>
                  <button className="dash-cancel-btn" onClick={() => { setEditing(false); setEditName(fullName); setEditPhone(phone); setEditAddress(address); }}>Cancel</button>
                </>
              ) : (
                <button className="dash-edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
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
                <p>No orders yet. Start shopping! 🛍️</p>
                <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
              </div>
            ) : (
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr><th>Order ID</th><th>Product Name</th><th>Qty</th><th>Total</th><th>Status</th><th>Date Ordered</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const item = order.order_items?.[0];
                      const canCancel = order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing";
                      return (
                        <tr key={order.id}>
                          <td className="dash-order-id">#{order.id.slice(0, 8)}...</td>
                          <td>{item?.product_name ?? "—"}</td>
                          <td>{item?.quantity ?? "—"}</td>
                          <td style={{fontWeight:'bold', color:'#e91e8c'}}>₱{order.total_amount?.toFixed(2)}</td>
                          <td><span className={`dash-status ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            {canCancel ? (
                              <button className="dash-cancel-order-btn" onClick={() => handleCancel(order.id)}>Cancel</button>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
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
                        <td style={{fontWeight:'bold', color:'#e91e8c'}}>
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
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love 🌸</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 masarquemae65@gmail.com</p><p>📱 09706383306</p><p>📍 Masbate, Philippines</p></div>
      </footer>

    </main>
  );
}
