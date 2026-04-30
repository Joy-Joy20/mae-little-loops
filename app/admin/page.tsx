"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Order = { id: string; user_email: string; total_amount: number; status: string; created_at: string; name: string; order_items?: { product_name: string; quantity: number }[]; };
type Product = { name: string; price: string; category: string; stock: number; };
type User = { id: string; email: string; created_at: string; };
type Message = { id: string; name: string; email: string; subject: string; message: string; created_at: string; };

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const products: Product[] = [
    { name: "Rainbow Tulip Charm", price: "₱200", category: "Bouquet", stock: 10 },
    { name: "Pastel Blossom Bouquet", price: "₱250", category: "Bouquet", stock: 8 },
    { name: "Lavender Bell Flowers", price: "₱300", category: "Bouquet", stock: 5 },
    { name: "Mini White Pastel Flower Bouquet", price: "₱150", category: "Bouquet", stock: 12 },
    { name: "Pink Star Lily Bloom", price: "₱200", category: "Bouquet", stock: 7 },
    { name: "Pastel Twin Tulips", price: "₱250", category: "Bouquet", stock: 6 },
    { name: "Pure White Rosebud", price: "₱300", category: "Bouquet", stock: 4 },
    { name: "Pink Tulip Delight", price: "₱150", category: "Bouquet", stock: 9 },
    { name: "Graduation Penguin", price: "₱80", category: "Keychain", stock: 15 },
    { name: "Frog-Hat", price: "₱90", category: "Keychain", stock: 11 },
    { name: "Strawberry-Hat Creature", price: "₱100", category: "Keychain", stock: 8 },
    { name: "Purple Bow", price: "₱95", category: "Keychain", stock: 13 },
    { name: "Monkey D. Luffy", price: "₱110", category: "Keychain", stock: 6 },
    { name: "Teddy Bear", price: "₱75", category: "Keychain", stock: 20 },
    { name: "Kuromi (Head Only)", price: "₱88", category: "Keychain", stock: 9 },
    { name: "Brown Teddy Bear", price: "₱75", category: "Keychain", stock: 14 },
  ];

const [storeName, setStoreName] = useState("Mae Little Loops Studio");
  const [storeEmail, setStoreEmail] = useState("maelittleloops@gmail.com");
  const [storePhone, setStorePhone] = useState("09XXXXXXXXX");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (email !== "admin@maelittleloops.com") {
        router.push("/login");
      } else {
        setLoading(false);
        // Fetch real orders from Supabase
        supabase.from("orders").select(`id, user_email, total_amount, status, created_at, name, order_items ( product_name, quantity )`)
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setOrders(data as Order[]); });
        // Fetch real users from Supabase
        supabase.from("profiles").select("id, email, created_at")
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setUsers(data as User[]); });
        // Fetch messages
        supabase.from("messages").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data) setMessages(data);
        });
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function updateOrderStatus(orderId: string, newStatus: string, customerEmail: string) {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { alert("Failed to update status."); return; }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    // Send email notification to customer
    const statusColors: Record<string, string> = {
      Pending: "#856404", Processing: "#004085", Shipped: "#155724", Delivered: "#0c5460", Cancelled: "#721c24",
    };
    const color = statusColors[newStatus] || "#c44dff";
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Your Order Status Updated — ${newStatus}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#e91e8c;">Mae Little Loops Studio 🌸</h2>
            <p>Hi! Your order status has been updated.</p>
            <div style="background:#f9f0ff;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
              <p style="font-size:13px;color:#888;margin-bottom:8px;">Order Status</p>
              <span style="background:${color}22;color:${color};padding:6px 20px;border-radius:50px;font-weight:700;font-size:16px;">${newStatus}</span>
            </div>
            <p style="color:#666;">Thank you for shopping with us! 💕</p>
            <p style="color:#aaa;font-size:12px;margin-top:16px;">If you have questions, reply to this email or contact us on Facebook.</p>
          </div>
        `,
      }),
    });
  }

  function toggleShipped(index: number) {
    setOrders(prev => prev.map((o, i) => i === index ? { ...o } : o));
  }

  if (loading) return (
    <div style={{display:'flex',height:'100vh',background:'#f8f4ff'}}>
      <div style={{width:'240px',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',padding:'24px',display:'flex',flexDirection:'column',gap:'12px'}}>
        <div className="skeleton" style={{width:'120px',height:'32px',borderRadius:'8px',background:'rgba(255,255,255,0.3)'}} />
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{height:'40px',borderRadius:'10px',background:'rgba(255,255,255,0.2)'}} />)}
      </div>
      <div style={{flex:1,padding:'32px',display:'flex',flexDirection:'column',gap:'24px'}}>
        <div className="skeleton" style={{width:'200px',height:'32px'}} />
        <div style={{display:'flex',gap:'16px'}}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card skeleton" style={{flex:1,height:'80px'}} />)}
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-line" style={{width:'30%',marginBottom:'20px'}} />
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-line" style={{marginBottom:'12px'}} />)}
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: "🛍️", color: "#f48fb1" },
    { label: "Total Orders", value: orders.length.toString(), icon: "📦", color: "#81d4fa" },
    { label: "Total Users", value: users.length.toString(), icon: "👥", color: "#a5d6a7" },
    { label: "Revenue", value: "₱" + orders.filter(o => o.status === "Delivered").reduce((s, o) => s + (o.total_amount ?? 0), 0).toLocaleString(), icon: "💰", color: "#ffcc80" },
  ];

  const navItems = [
    { label: "Dashboard", icon: "📊" },
    { label: "Products", icon: "🛍️" },
    { label: "Orders", icon: "📦" },
    { label: "Users", icon: "👥" },
    { label: "Messages", icon: "✉️" },
    { label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🌸</span>
          <span className="logo-text">Mae Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`} onClick={() => setActive(item.label)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="logout-item" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="admin-main">

        {/* TOP BAR */}
        <div className="admin-topbar">
          <div>
            <h1>{active}</h1>
            <p className="topbar-sub">{active === "Dashboard" ? "Welcome back, Admin 👋" : `Manage your ${active.toLowerCase()}`}</p>
          </div>
          <span className="admin-avatar">👤 Admin</span>
        </div>

        {/* ===== DASHBOARD ===== */}
        {active === "Dashboard" && (
          <>
            <div className="admin-stats">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{background: s.color + '22', color: s.color}}>{s.icon}</div>
                  <div>
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-value">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-table-card">
              <div className="table-header">
                <h2>Recent Orders</h2>
                <span className="table-badge">{orders.length} orders</span>
              </div>
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign:'center', color:'#aaa', padding:'24px'}}>No orders yet.</td></tr>
                  ) : (
                    orders.slice(0,4).map((o) => (
                      <tr key={o.id}>
                        <td className="order-id">#{o.id.slice(0,8)}...</td>
                        <td>{o.user_email}</td>
                        <td>{o.order_items?.[0]?.product_name ?? "—"}</td>
                        <td className="order-price">₱{o.total_amount?.toFixed(2)}</td>
                        <td><span className={`status-badge ${o.status === "Delivered" ? "done" : o.status === "Shipped" ? "shipped" : "pending"}`}>{o.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-table-card" style={{marginTop:'24px'}}>
              <div className="table-header">
                <h2>Recent Messages</h2>
                <span className="table-badge">{messages.length} messages</span>
              </div>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th></tr></thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign:'center', color:'#aaa', padding:'24px'}}>No messages yet.</td></tr>
                  ) : (
                    messages.slice(0,3).map((m, i) => (
                      <tr key={i}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.subject}</td>
                        <td>{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== PRODUCTS ===== */}
        {active === "Products" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>All Products</h2>
              <span className="table-badge">{products.length} products</span>
            </div>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td><span className={`cat-badge ${p.category === "Bouquet" ? "bouquet" : "keychain"}`}>{p.category}</span></td>
                    <td className="order-price">{p.price}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {active === "Orders" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>All Orders</h2>
              <span className="table-badge">{orders.length} orders</span>
            </div>
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:'center', color:'#aaa', padding:'24px'}}>No orders yet.</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td className="order-id">#{o.id.slice(0,8)}...</td>
                      <td>{o.user_email}</td>
                      <td>{o.order_items?.[0]?.product_name ?? "—"}</td>
                      <td className="order-price">₱{o.total_amount?.toFixed(2)}</td>
                      <td>
                        <select className="status-select" value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value, o.user_email)}>
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== USERS ===== */}
        {active === "Users" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>All Users</h2>
              <span className="table-badge">{users.length} users</span>
            </div>
            <table className="admin-table">
              <thead><tr><th>Email</th><th>Joined</th><th>Role</th></tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={3} style={{textAlign:'center', color:'#aaa', padding:'24px'}}>No users yet.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td><span className="role-badge">Customer</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {active === "Messages" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>Recent Messages</h2>
              <span className="table-badge">{messages.length} messages</span>
            </div>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th></tr></thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:'center', color:'#aaa', padding:'24px'}}>No messages yet.</td></tr>
                ) : (
                  messages.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.subject}</td>
                      <td style={{maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.message}</td>
                      <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {active === "Settings" && (
          <div className="settings-card">
            <h2>Store Settings</h2>
            {settingsSaved && <div className="settings-saved">✅ Settings saved!</div>}
            <div className="settings-form">
              <div className="settings-group">
                <label>Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="settings-group">
                <label>Email</label>
                <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
              </div>
              <div className="settings-group">
                <label>Phone Number</label>
                <input type="text" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
              </div>
              <button className="save-btn" onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}>
                Save Changes
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
