"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { validateAndNormalizeProductInput } from "../../lib/product-validation";

type Order = {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  name: string;
  order_items?: { product_name: string; quantity: number }[];
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  image_url: string;
};

type User = { id: string; email: string; created_at: string };
type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

type ProductFormState = {
  name: string;
  price: string;
  category: "bouquet" | "keychain";
  stock: string;
  description: string;
  image_url: string;
};

const ADMIN_EMAIL = "admin@maelittleloops.com";
const emptyProduct: ProductFormState = {
  name: "",
  price: "",
  category: "bouquet",
  stock: "0",
  description: "",
  image_url: "",
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [storeName, setStoreName] = useState("Mae Little Loops Studio");
  const [storeEmail, setStoreEmail] = useState("maelittleloops@gmail.com");
  const [storePhone, setStorePhone] = useState("09XXXXXXXXX");
  const [settingsSaved, setSettingsSaved] = useState(false);

  async function fetchProducts() {
    try {
      console.log("Fetching product list from /api/products...");
      const response = await fetch("/api/products", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch products:", result);
        alert(result.error || "Failed to load products.");
        return;
      }

      setProducts((result.products ?? []) as Product[]);
    } catch (error) {
      console.error("Unexpected fetchProducts error:", error);
      alert("Unexpected error while loading products.");
    }
  }

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Failed to get Supabase session:", error);
      return null;
    }

    return session?.access_token ?? null;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (email !== ADMIN_EMAIL) {
        router.push("/login");
      } else {
        setLoading(false);
        supabase
          .from("orders")
          .select(
            "id, user_email, total_amount, status, created_at, name, order_items ( product_name, quantity )",
          )
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data) setOrders(data as Order[]);
          });
        supabase
          .from("profiles")
          .select("id, email, created_at")
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data) setUsers(data as User[]);
          });
        supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data) setMessages(data);
          });
        fetchProducts();
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function updateOrderStatus(
    orderId: string,
    newStatus: string,
    customerEmail: string,
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      alert("Failed to update status.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    const statusColors: Record<string, string> = {
      Pending: "#856404",
      Processing: "#004085",
      Shipped: "#155724",
      Delivered: "#0c5460",
      Cancelled: "#721c24",
    };
    const color = statusColors[newStatus] || "#c44dff";
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Your Order Status Updated - ${newStatus}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#e91e8c;">Mae Little Loops Studio</h2><p>Your order status has been updated.</p><div style="background:#f9f0ff;border-radius:12px;padding:20px;margin:16px 0;text-align:center;"><span style="background:${color}22;color:${color};padding:6px 20px;border-radius:50px;font-weight:700;font-size:16px;">${newStatus}</span></div><p style="color:#666;">Thank you for shopping with us!</p></div>`,
      }),
    });
  }

  function openCreate() {
    setEditProduct(null);
    setFormData(emptyProduct);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price ?? ""),
      category: product.category as "bouquet" | "keychain",
      stock: String(product.stock ?? 0),
      description: product.description ?? "",
      image_url: product.image_url ?? "",
    });
    setShowForm(true);
  }

  async function handleSaveProduct() {
    const { data: payload, errors } = validateAndNormalizeProductInput({
      ...formData,
      price: formData.price.trim(),
      stock: formData.stock.trim(),
    });

    if (!payload) {
      console.error("Product form validation failed:", { formData, errors });
      alert(errors.join("\n"));
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      alert("Your admin session is missing. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";

      console.log(`${method} ${url}`, payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        console.error("Product save failed:", result);
        const details = Array.isArray(result.details)
          ? result.details.join("\n")
          : result.details;
        alert([result.error, details].filter(Boolean).join("\n"));
        return;
      }

      console.log("Product saved successfully:", result.product);
      await fetchProducts();
      setShowForm(false);
      setEditProduct(null);
      setFormData(emptyProduct);
    } catch (error) {
      console.error("Unexpected handleSaveProduct error:", error);
      alert("Unexpected error while saving product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!window.confirm("Delete this product?")) return;

    const accessToken = await getAccessToken();
    if (!accessToken) {
      alert("Your admin session is missing. Please log in again.");
      return;
    }

    setDeleteId(id);
    try {
      console.log(`DELETE /api/products/${id}`);
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        console.error("Product delete failed:", result);
        alert(result.error || "Failed to delete product.");
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error("Unexpected handleDeleteProduct error:", error);
      alert("Unexpected error while deleting product.");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading)
    return (
      <div style={{ display: "flex", height: "100vh", background: "#f8f4ff" }}>
        <div
          style={{
            width: "240px",
            background: "linear-gradient(135deg,#ff6b9d,#c44dff)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            className="skeleton"
            style={{
              width: "120px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.3)",
            }}
          />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: "40px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div className="skeleton" style={{ width: "200px", height: "32px" }} />
          <div style={{ display: "flex", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card skeleton" style={{ flex: 1, height: "80px" }} />
            ))}
          </div>
          <div className="skeleton-card">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-line" style={{ marginBottom: "12px" }} />
            ))}
          </div>
        </div>
      </div>
    );

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: "Products", color: "#f48fb1" },
    { label: "Total Orders", value: orders.length.toString(), icon: "Orders", color: "#81d4fa" },
    { label: "Total Users", value: users.length.toString(), icon: "Users", color: "#a5d6a7" },
    {
      label: "Revenue",
      value:
        "PHP " +
        orders
          .filter((o) => o.status?.toLowerCase() === "delivered")
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
          .toLocaleString(),
      icon: "Revenue",
      color: "#ffcc80",
    },
  ];

  const navItems = [
    { label: "Dashboard", icon: "Dashboard" },
    { label: "Products", icon: "Products" },
    { label: "Orders", icon: "Orders" },
    { label: "Users", icon: "Users" },
    { label: "Messages", icon: "Messages" },
    { label: "Settings", icon: "Settings" },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">Store</span>
          <span className="logo-text">Mae Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${active === item.label ? "active" : ""}`}
              onClick={() => setActive(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="logout-item" onClick={handleLogout}>
          <span>Exit</span> Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>{active}</h1>
            <p className="topbar-sub">
              {active === "Dashboard"
                ? "Welcome back, Admin"
                : `Manage your ${active.toLowerCase()}`}
            </p>
          </div>
          <span className="admin-avatar">Admin</span>
        </div>

        {active === "Dashboard" && (
          <>
            <div className="admin-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ background: stat.color + "22", color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">{stat.value}</p>
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
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 4).map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">#{order.id.slice(0, 8)}...</td>
                        <td>{order.user_email}</td>
                        <td>{order.order_items?.[0]?.product_name ?? "-"}</td>
                        <td className="order-price">PHP {order.total_amount?.toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              order.status?.toLowerCase() === "delivered"
                                ? "done"
                                : order.status?.toLowerCase() === "shipped"
                                  ? "shipped"
                                  : "pending"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === "Products" && (
          <>
            {showForm && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
                onClick={() => setShowForm(false)}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "32px",
                    width: "100%",
                    maxWidth: "480px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#222" }}>
                    {editProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <div className="settings-form">
                    <div className="settings-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rainbow Tulip Charm"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div className="settings-group" style={{ flex: 1 }}>
                        <label>Price (PHP) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="settings-group" style={{ flex: 1 }}>
                        <label>Stock *</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="settings-group">
                      <label>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as "bouquet" | "keychain",
                          })
                        }
                        style={{
                          padding: "12px 16px",
                          border: "1.5px solid #fce4ec",
                          borderRadius: "12px",
                          background: "#fff9fb",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      >
                        <option value="bouquet">Bouquet</option>
                        <option value="keychain">Keychain</option>
                      </select>
                    </div>
                    <div className="settings-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="/Rainbow Tulip Charm.png"
                      />
                    </div>
                    <div className="settings-group">
                      <label>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                        rows={3}
                        style={{
                          padding: "12px 16px",
                          border: "1.5px solid #fce4ec",
                          borderRadius: "12px",
                          background: "#fff9fb",
                          fontSize: "14px",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="save-btn" onClick={handleSaveProduct} disabled={saving} style={{ flex: 1 }}>
                        {saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        style={{
                          flex: 1,
                          padding: "13px",
                          border: "1.5px solid #fce4ec",
                          borderRadius: "12px",
                          background: "white",
                          color: "#888",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-table-card">
              <div className="table-header">
                <h2>All Products</h2>
                <span className="table-badge">{products.length} products</span>
                <button
                  onClick={openCreate}
                  style={{
                    marginLeft: "auto",
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "50px",
                    background: "linear-gradient(135deg,#ff6b9d,#c44dff)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(196,77,255,0.3)",
                  }}
                >
                  + Add Product
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                        No products yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                          <span
                            className={`cat-badge ${product.category === "bouquet" ? "bouquet" : "keychain"}`}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td className="order-price">PHP {parseFloat(String(product.price)).toFixed(2)}</td>
                        <td>{product.stock}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => openEdit(product)}
                              style={{
                                padding: "5px 14px",
                                borderRadius: "20px",
                                border: "1.5px solid #c44dff",
                                background: "white",
                                color: "#c44dff",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteId === product.id}
                              style={{
                                padding: "5px 14px",
                                borderRadius: "20px",
                                border: "1.5px solid #e91e8c",
                                background: "white",
                                color: "#e91e8c",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              {deleteId === product.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === "Orders" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>All Orders</h2>
              <span className="table-badge">{orders.length} orders</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id.slice(0, 8)}...</td>
                      <td>{order.user_email}</td>
                      <td>{order.order_items?.[0]?.product_name ?? "-"}</td>
                      <td className="order-price">PHP {order.total_amount?.toFixed(2)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value, order.user_email)
                          }
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {active === "Users" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>All Users</h2>
              <span className="table-badge">{users.length} users</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                      No users yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className="role-badge">Customer</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {active === "Messages" && (
          <div className="admin-table-card">
            <div className="table-header">
              <h2>Messages</h2>
              <span className="table-badge">{messages.length} messages</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                      No messages yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((message, index) => (
                    <tr key={index}>
                      <td>{message.name}</td>
                      <td>{message.email}</td>
                      <td>{message.subject}</td>
                      <td
                        style={{
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {message.message}
                      </td>
                      <td>{new Date(message.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {active === "Settings" && (
          <div className="settings-card">
            <h2>Store Settings</h2>
            {settingsSaved && <div className="settings-saved">Settings saved!</div>}
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
              <button
                className="save-btn"
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
