"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Order = { id: string; customer: string; product: string; price: string; status: string; shipped: boolean; };
type Product = { name: string; price: string; category: string; stock: number; };
type User = { email: string; joined: string; role: string; };
type Message = { id: string; name: string; email: string; subject: string; message: string; created_at: string; };

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([
    { id: "#001", customer: "Joy", product: "Flower Bouquet", price: "₱250", status: "Completed", shipped: true },
    { id: "#002", customer: "Ana", product: "Keychain", price: "₱150", status: "Pending", shipped: false },
    { id: "#003", customer: "Mae", product: "Pastel Blossom Bouquet", price: "₱250", status: "Completed", shipped: true },
    { id: "#004", customer: "Lyn", product: "Rainbow Tulip Charm", price: "₱200", status: "Pending", shipped: false },
    { id: "#005", customer: "Rose", product: "Lavender Bell Flowers", price: "₱300", status: "Shipped", shipped: true },
  ]);

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

  const users: User[] = [
    { email: "joy@gmail.com", joined: "2025-01-10", role: "Customer" },
    { email: "ana@gmail.com", joined: "2025-01-15", role: "Customer" },
    { email: "mae@gmail.com", joined: "2025-01-20", role: "Customer" },
    { email: "lyn@gmail.com", joined: "2025-02-01", role: "Customer" },
    { email: "rose@gmail.com", joined: "2025-02-10", role: "Customer" },
  ];

  const [storeName, setStoreName] = useState("Mae Sister's Bouquet");
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

  function updateOrderStatus(index: number, status: string) {
    setOrders(prev => prev.map((o, i) => i === index ? { ...o, status } : o));
  }

  function toggleShipped(index: number) {
    setOrders(prev => prev.map((o, i) => i === index ? { ...o, shipped: !o.shipped } : o));
  }

  if (loading) return <div className="admin-loading">Loading...</div>;

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: "🛍️", color: "#f48fb1" },
    { label: "Total Orders", value: orders.length.toString(), icon: "📦", color: "#81d4fa" },
    { label: "Total Users", value: users.length.toString(), icon: "👥", color: "#a5d6a7" },
    { label: "Revenue", value: "₱" + orders.filter(o => o.status === "Completed").reduce((s, o) => s + parseInt(o.price.replace("₱","")), 0).toLocaleString(), icon: "💰", color: "#ffcc80" },
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
                <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.slice(0,4).map((o, i) => (
                    <tr key={i}>
                      <td className="order-id">{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.product}</td>
                      <td className="order-price">{o.price}</td>
                      <td><span className={`status-badge ${o.status === "Completed" ? "done" : o.status === "Shipped" ? "shipped" : "pending"}`}>{o.status}</span></td>
                    </tr>
                  ))}
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
              <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Price</th><th>Status</th><th>Shipped</th></tr></thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i}>
                    <td className="order-id">{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.product}</td>
                    <td className="order-price">{o.price}</td>
                    <td>
                      <select className="status-select" value={o.status} onChange={(e) => updateOrderStatus(i, e.target.value)}>
                        <option>Pending</option>
                        <option>Shipped</option>
                        <option>Completed</option>
                      </select>
                    </td>
                    <td>
                      <button className={`shipped-btn ${o.shipped ? "yes" : "no"}`} onClick={() => toggleShipped(i)}>
                        {o.shipped ? "✅ Shipped" : "❌ Not Shipped"}
                      </button>
                    </td>
                  </tr>
                ))}
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
                {users.map((u, i) => (
                  <tr key={i}>
                    <td>{u.email}</td>
                    <td>{u.joined}</td>
                    <td><span className="role-badge">{u.role}</span></td>
                  </tr>
                ))}
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
