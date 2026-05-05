"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type OrderItem = { product_name: string; quantity: number; };
type Order = { id: string; created_at: string; total_amount: number; status: string; order_items: OrderItem[]; };
type CartItem = { id: string; product_name: string; price: string; quantity: number; img: string | null; };
type UserMessage = { id: string; subject: string; message: string; created_at: string; replied?: boolean; message_replies?: { id: string; reply: string; created_at: string }[]; };

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
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "tracking" | "cart" | "messages">("profile");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  async function fetchUserMessages(email: string) {
    const { data } = await supabase
      .from("messages")
      .select("id, subject, message, created_at, replied, message_replies(id, reply, created_at)")
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (data) setUserMessages(data as UserMessage[]);
  }

  useEffect(() => {
    if (!userEmail) return;
    const sub = supabase
      .channel(`msg-replies-${userEmail}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_replies" }, async (payload) => {
        await fetchUserMessages(userEmail);
        const mid = (payload.new as { message_id: string }).message_id;
        if (mid) setExpandedMsg(mid);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [userEmail]);

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
    if (activeTab === "messages" && userEmail) fetchUserMessages(userEmail);
  }, [activeTab]);

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
    { key: "tracking", label: "🚚 Order Tracking" },
    { key: "cart", label: "🛒 My Cart" },
    { key: "messages", label: "📬 Messages" },
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

        {/* ORDER TRACKING TAB */}
        {activeTab === "tracking" && (
          <div className="dash-card">
            <h3 className="dash-card-title">Order Tracking</h3>
            {orders.length === 0 ? (
              <div className="dash-empty">
                <p>No orders to track yet.</p>
                <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
                {orders.map((order) => {
                  const steps = [
                    { key: 'pending',    label: 'Order Placed',  desc: 'Your order has been received.' },
                    { key: 'processing', label: 'Processing',    desc: 'We are preparing your order.' },
                    { key: 'shipped',    label: 'Shipped',       desc: 'Your order is on the way.' },
                    { key: 'delivered',  label: 'Delivered',     desc: 'Order delivered successfully.' },
                  ];
                  const statusLower = order.status?.toLowerCase();
                  const isCancelled = statusLower === 'cancelled';
                  const currentStep = steps.findIndex(s => s.key === statusLower);
                  const activeStep = currentStep === -1 ? 0 : currentStep;
                  return (
                    <div key={order.id} style={{border:'1.5px solid #fce4ec',borderRadius:'16px',overflow:'hidden'}}>
                      {/* Order header */}
                      <div style={{background:'#fff9fb',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
                        <div>
                          <p style={{fontWeight:'700',margin:'0 0 2px',fontSize:'14px',color:'#333'}}>Order #{order.id.slice(0,8)}...</p>
                          <p style={{margin:0,fontSize:'12px',color:'#aaa'}}>{new Date(order.created_at).toLocaleDateString()} &mdash; {order.order_items?.[0]?.product_name ?? '—'}</p>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <span style={{fontWeight:'700',color:'#e91e8c',fontSize:'14px'}}>₱{order.total_amount?.toFixed(2)}</span>
                          {isCancelled
                            ? <span style={{background:'#ffebee',color:'#c62828',padding:'3px 12px',borderRadius:'50px',fontSize:'12px',fontWeight:'600'}}>Cancelled</span>
                            : <span style={{background:'#e8f5e9',color:'#2e7d32',padding:'3px 12px',borderRadius:'50px',fontSize:'12px',fontWeight:'600'}}>{order.status}</span>
                          }
                        </div>
                      </div>
                      {/* Tracker */}
                      <div style={{padding:'20px 18px'}}>
                        {isCancelled ? (
                          <div style={{textAlign:'center',padding:'16px',background:'#ffebee',borderRadius:'12px',color:'#c62828',fontWeight:'600',fontSize:'14px'}}>
                            This order has been cancelled.
                          </div>
                        ) : (
                          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'relative'}}>
                            {/* Progress line */}
                            <div style={{position:'absolute',top:'16px',left:'calc(12.5%)',right:'calc(12.5%)',height:'3px',background:'#fce4ec',zIndex:0}} />
                            <div style={{position:'absolute',top:'16px',left:'calc(12.5%)',height:'3px',background:'linear-gradient(90deg,#e91e8c,#f06292)',zIndex:1,width:`${(activeStep / (steps.length - 1)) * 100}%`,transition:'width 0.5s ease'}} />
                            {steps.map((step, i) => {
                              const done = i <= activeStep;
                              const active = i === activeStep;
                              return (
                                <div key={step.key} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,zIndex:2}}>
                                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:done ? 'linear-gradient(135deg,#e91e8c,#f06292)' : '#fce4ec',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'8px',boxShadow:active ? '0 0 0 4px rgba(233,30,140,0.2)' : 'none',transition:'all 0.3s'}}>
                                    {done
                                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                      : <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#f48fb1'}} />
                                    }
                                  </div>
                                  <p style={{margin:0,fontSize:'12px',fontWeight:active ? '700' : '500',color:done ? '#e91e8c' : '#aaa',textAlign:'center'}}>{step.label}</p>
                                  {active && <p style={{margin:'2px 0 0',fontSize:'11px',color:'#888',textAlign:'center',maxWidth:'80px'}}>{step.desc}</p>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <h3 className="dash-card-title">My Messages</h3>
            {userMessages.length === 0 ? (
              <div className="dash-empty">
                <p>No messages yet.</p>
                <button onClick={() => router.push("/contact_us")}>Send a Message</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {userMessages.map((m) => (
                  <div key={m.id} style={{border:'1.5px solid #fce4ec',borderRadius:'16px',overflow:'hidden'}}>
                    <div onClick={() => setExpandedMsg(expandedMsg === m.id ? null : m.id)} style={{padding:'14px 18px',background:'#fff9fb',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
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
                    {expandedMsg === m.id && (
                      <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:'10px',background:'white'}}>
                        <div style={{alignSelf:'flex-end',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',padding:'10px 14px',borderRadius:'12px 4px 12px 12px',maxWidth:'80%',fontSize:'14px'}}>
                          <p style={{margin:'0 0 2px',fontSize:'11px',opacity:0.8}}>You</p>
                          <p style={{margin:0}}>{m.message}</p>
                          <p style={{margin:'4px 0 0',fontSize:'11px',opacity:0.7}}>{new Date(m.created_at).toLocaleString()}</p>
                        </div>
                        {m.message_replies && m.message_replies.length > 0 ? (
                          [...m.message_replies]
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map(r => (
                              <div key={r.id} style={{alignSelf:'flex-start',background:'#fce4ec',color:'#333',padding:'10px 14px',borderRadius:'4px 12px 12px 12px',maxWidth:'80%',fontSize:'14px'}}>
                                <p style={{margin:'0 0 2px',fontSize:'11px',fontWeight:'700',color:'#e91e8c'}}>Mae Little Loops Studio</p>
                                <p style={{margin:0}}>{r.reply}</p>
                                <p style={{margin:'4px 0 0',fontSize:'11px',color:'#aaa'}}>{new Date(r.created_at).toLocaleString()}</p>
                              </div>
                            ))
                        ) : (
                          <p style={{color:'#aaa',fontSize:'13px',textAlign:'center',margin:'4px 0'}}>No reply yet. We will get back to you soon!</p>
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
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p>
          <p style={{margin:"12px 0 6px",fontWeight:"600",fontSize:"13px",opacity:0.9}}>Follow Us</p>
          <div style={{display:"flex",gap:"12px"}}>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer" title="Facebook" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@mae.littleloops" target="_blank" rel="noopener noreferrer" title="TikTok" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
            <a href="mailto:masarquemae65@gmail.com" title="Email" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            masarquemae65@gmail.com
          </p>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            09706383306
          </p>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Masbate, Philippines
          </p>
        </div>
        <div className="footer-bottom" style={{gridColumn:'1/-1',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'16px',fontSize:'13px',opacity:0.8}}>
          &copy; {new Date().getFullYear()} Mae Little Loops Studio. All Rights Reserved.
        </div>
      </footer>






    </main>
  );
}
