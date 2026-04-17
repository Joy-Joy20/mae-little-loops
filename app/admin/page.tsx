"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (email !== "admin@maelittleloops.com") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh'}}>Loading...</div>;

  const stats = [
    { label: "Total Products", value: "18", icon: "🛍️", color: "#f48fb1" },
    { label: "Total Orders", value: "8", icon: "📦", color: "#81d4fa" },
    { label: "Total Users", value: "5", icon: "👥", color: "#a5d6a7" },
    { label: "Revenue", value: "₱2,450", icon: "💰", color: "#ffcc80" },
  ];

  const orders = [
    { id: "#001", customer: "Joy", product: "Flower Bouquet", price: "₱250", status: "Completed" },
    { id: "#002", customer: "Ana", product: "Keychain", price: "₱150", status: "Pending" },
    { id: "#003", customer: "Mae", product: "Pastel Blossom Bouquet", price: "₱250", status: "Completed" },
    { id: "#004", customer: "Lyn", product: "Rainbow Tulip Charm", price: "₱200", status: "Pending" },
  ];

  const navItems = ["Dashboard", "Products", "Orders", "Users", "Settings"];

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
            <button key={item} className={`nav-item ${active === item ? "active" : ""}`} onClick={() => setActive(item)}>
              <span className="nav-icon">
                {item === "Dashboard" ? "📊" : item === "Products" ? "🛍️" : item === "Orders" ? "📦" : item === "Users" ? "👥" : "⚙️"}
              </span>
              {item}
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
            <h1>Dashboard Overview</h1>
            <p className="topbar-sub">Welcome back, Admin 👋</p>
          </div>
          <div className="topbar-right">
            <span className="admin-avatar">👤 Admin</span>
          </div>
        </div>

        {/* STATS */}
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

        {/* RECENT ORDERS */}
        <div className="admin-table-card">
          <div className="table-header">
            <h2>Recent Orders</h2>
            <span className="table-badge">{orders.length} orders</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i}>
                  <td className="order-id">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.product}</td>
                  <td className="order-price">{o.price}</td>
                  <td>
                    <span className={`status-badge ${o.status === "Completed" ? "done" : "pending"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
