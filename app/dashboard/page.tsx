"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type OrderItem = { product_name: string; quantity: number; };
type Order = { id: string; created_at: string; total_amount: number; status: string; order_items: OrderItem[]; };
type CartItem = { id: string; product_name: string; price: string; quantity: number; img: string | null; };
type UserMessage = { id: string; name: string; email: string; subject: string; message: string; created_at: string; replied?: boolean; replies?: { id: string; reply: string; created_at: string }[]; };

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
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "cart" | "messages">("profile");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Messages state
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  async function fetchUserMessages(email: string) {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("messages")
      .select("*, message_replies(id, reply, created_at)")
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (data) setUserMessages(data as UserMessage[]);
    setLoadingMsgs(false);
  }

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
      if (!profile?.username) setShowProfilePrompt(true);

      await fetchOrders(user.id);

      const { data: cartData } = await supabase.from("cart").select("*").eq("user_id", user.id);
      if (cartData) setCartItems(cartData);

      // Fetch user's contact messages with replies
      if (user.email) fetchUserMessages(user.email);

      setLoading(false);
    });
  }, [router]);

  async function handleSaveName() {
    if (!userId) return;
    setProfileError("");
    setProfileSuccess("");
    if (!editName.trim()) { setProfileError("Full Name is required."); return; }
    if (!editPhone.trim()) { setProfileError("Phone Number is required."); return; }
    if (!editAddress.trim()) { setProfileError("Delivery Address is required."); return; }
    setSavingName(true);
    const { error } = await supabase.from("users").upsert({ id: userId, username: editName.trim(), email: userEmail, phone: editPhone.trim(), address: editAddress.trim() });
    if (error) {
      setProfileError(error.message);
    } else {
      setFullName(editName.trim());
      setPhone(editPhone.trim());
      setAddress(editAddress.trim());
      setEditing(false);
      setShowProfilePrompt(false);
      setProfileSuccess("Profile saved successfully! 🌸");
    }
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

  useEffect(() => {
    if (showProfilePrompt) {
      const timer = setTimeout(() => setShowProfilePrompt(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showProfilePrompt]);

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
    { key: "messages", label: "💬 Messages" },
  ];

  return (
    <main className="dash-page">

      {/* PROFILE PROMPT TOAST */}
      {showProfilePrompt && (
        <div style={{position:'fixed',top:'80px',left:'50%',transform:'translateX(-50%)',zIndex:999,background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',padding:'14px 24px',borderRadius:'50px',boxShadow:'0 6px 20px rgba(233,30,140,0.3)',display:'flex',alignItems:'center',gap:'12px',fontSize:'14px',fontWeight:'600',maxWidth:'90vw'}}>
          <span>👋 Welcome! Please complete your profile first.</span>
          <button onClick={() => { setActiveTab('profile'); setShowProfilePrompt(false); }} style={{background:'white',color:'#e91e8c',padding:'6px 16px',borderRadius:'50px',border:'none',fontWeight:'700',fontSize:'13px',cursor:'pointer',whiteSpace:'nowrap'}}>Edit Profile</button>
          <button onClick={() => setShowProfilePrompt(false)} style={{background:'rgba(255,255,255,0.3)',border:'none',borderRadius:'50%',width:'24px',height:'24px',color:'white',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>✕</button>
        </div>
      )}

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

            {/* Warning banner when fields are incomplete */}
            {(!fullName.trim() || !phone.trim() || !address.trim()) && !editing && (
              <div style={{background:'#fff3cd',border:'1px solid #fce4ec',borderRadius:'8px',padding:'10px 14px',color:'#c2185b',fontSize:'13px',marginBottom:'12px'}}>
                ⚠️ Please fill in all required fields: Full Name, Phone Number, and Delivery Address to enable ordering.
              </div>
            )}

            {profileError && (
              <div style={{background:'#fce4ec',border:'1px solid #f48fb1',borderRadius:'8px',padding:'10px 14px',color:'#c2185b',fontSize:'13px',marginBottom:'12px'}}>
                ❌ {profileError}
              </div>
            )}
            {profileSuccess && (
              <div style={{background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:'8px',padding:'10px 14px',color:'#2e7d32',fontSize:'13px',marginBottom:'12px'}}>
                {profileSuccess}
              </div>
            )}

            <div className="dash-field">
              <label>Email</label>
              <p>{userEmail}</p>
            </div>
            <div className="dash-field">
              <label>Full Name <span style={{color:'#e91e8c'}}>*</span></label>
              {editing ? (
                <input className="dash-input" value={editName} onChange={(e) => { setEditName(e.target.value); setProfileError(""); }} placeholder="Enter your full name" style={{border: !editName.trim() ? '1.5px solid #f48fb1' : '1.5px solid #fce4ec'}} />
              ) : (
                <p>{fullName || <span style={{color:'#f48fb1'}}>Not set</span>}</p>
              )}
            </div>
            <div className="dash-field">
              <label>Phone Number <span style={{color:'#e91e8c'}}>*</span></label>
              {editing ? (
                <input className="dash-input" value={editPhone} onChange={(e) => { setEditPhone(e.target.value); setProfileError(""); }} placeholder="Enter your phone number" style={{border: !editPhone.trim() ? '1.5px solid #f48fb1' : '1.5px solid #fce4ec'}} />
              ) : (
                <p>{phone || <span style={{color:'#f48fb1'}}>Not set</span>}</p>
              )}
            </div>
            <div className="dash-field">
              <label>Delivery Address <span style={{color:'#e91e8c'}}>*</span></label>
              {editing ? (
                <input className="dash-input" value={editAddress} onChange={(e) => { setEditAddress(e.target.value); setProfileError(""); }} placeholder="Enter your complete delivery address" style={{border: !editAddress.trim() ? '1.5px solid #f48fb1' : '1.5px solid #fce4ec'}} />
              ) : (
                <p>{address || <span style={{color:'#f48fb1'}}>Not set</span>}</p>
              )}
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
              {editing ? (
                <>
                  <button className="dash-save-btn" onClick={handleSaveName} disabled={savingName}>{savingName ? "Saving..." : "Save Changes"}</button>
                  <button className="dash-cancel-btn" onClick={() => { setEditing(false); setEditName(fullName); setEditPhone(phone); setEditAddress(address); setProfileError(""); setProfileSuccess(""); }}>Cancel</button>
                </>
              ) : (
                <button className="dash-edit-btn" onClick={() => { setEditing(true); setProfileSuccess(""); }}>Edit Profile</button>
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

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="dash-card">
            <h3 className="dash-card-title">My Messages
              <button onClick={() => userEmail && fetchUserMessages(userEmail)} disabled={loadingMsgs} style={{marginLeft:'12px',padding:'4px 14px',borderRadius:'50px',border:'none',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',fontSize:'12px',fontWeight:'600',cursor:'pointer',boxShadow:'0 2px 8px rgba(233,30,140,0.3)'}}>{loadingMsgs ? 'Refreshing...' : 'Refresh'}</button>
            </h3>
            {userMessages.length === 0 ? (
              <div className="dash-empty">
                <p>No messages sent yet.</p>
                <button onClick={() => router.push("/contact_us")}>Send a Message</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                {userMessages.map((m) => (
                  <div key={m.id} style={{border:'1.5px solid #fce4ec',borderRadius:'16px',overflow:'hidden'}}>
                    {/* Message header */}
                    <div
                      onClick={() => setExpandedMsg(expandedMsg === m.id ? null : m.id)}
                      style={{padding:'14px 18px',background:'#fff9fb',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
                    >
                      <div>
                        <p style={{fontWeight:'700',margin:'0 0 2px',fontSize:'14px',color:'#333'}}>{m.subject}</p>
                        <p style={{margin:0,fontSize:'12px',color:'#aaa'}}>{new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        {m.replied
                          ? <span style={{background:'#e8f5e9',color:'#2e7d32',padding:'3px 10px',borderRadius:'50px',fontSize:'12px',fontWeight:'600'}}>Replied</span>
                          : <span style={{background:'#fff3cd',color:'#f57f17',padding:'3px 10px',borderRadius:'50px',fontSize:'12px',fontWeight:'600'}}>Pending</span>
                        }
                        <span style={{color:'#e91e8c',fontSize:'12px'}}>{expandedMsg === m.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {/* Expanded thread */}
                    {expandedMsg === m.id && (
                      <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:'10px',background:'white'}}>
                        {/* User's original message */}
                        <div style={{alignSelf:'flex-end',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',padding:'10px 14px',borderRadius:'12px 4px 12px 12px',maxWidth:'80%',fontSize:'14px'}}>
                          <p style={{margin:'0 0 4px',fontSize:'11px',opacity:0.8}}>You</p>
                          <p style={{margin:0}}>{m.message}</p>
                          <p style={{margin:'4px 0 0',fontSize:'11px',opacity:0.7}}>{new Date(m.created_at).toLocaleString()}</p>
                        </div>
                        {/* Admin replies */}
                        {m.replies && m.replies.length > 0 ? (
                          m.replies
                            .slice()
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map(r => (
                              <div key={r.id} style={{alignSelf:'flex-start',background:'#fce4ec',color:'#333',padding:'10px 14px',borderRadius:'4px 12px 12px 12px',maxWidth:'80%',fontSize:'14px'}}>
                                <p style={{margin:'0 0 4px',fontSize:'11px',fontWeight:'700',color:'#e91e8c'}}>Mae Little Loops Studio</p>
                                <p style={{margin:0}}>{r.reply}</p>
                                <p style={{margin:'4px 0 0',fontSize:'11px',color:'#aaa'}}>{new Date(r.created_at).toLocaleString()}</p>
                              </div>
                            ))
                        ) : (
                          <p style={{color:'#aaa',fontSize:'13px',textAlign:'center',margin:'4px 0'}}>No reply yet. We will get back to you soon! 🌸</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <footer>
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>masarquemae65@gmail.com</p><p>09706383306</p><p>Masbate, Philippines</p></div>
      </footer>


    </main>
  );
}
