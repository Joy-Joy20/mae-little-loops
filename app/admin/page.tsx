"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { validateAndNormalizeProductInput } from "../../lib/product-validation";

type Order = { id: string; user_email: string; total_amount: number; status: string; created_at: string; name: string; rider_id?: string; rider_name?: string; rider_phone?: string; proof_of_delivery?: string; delivered_at?: string; receipt_url?: string; payment_verified?: boolean; order_items?: { product_name: string; quantity: number }[]; };
type Product = { id: number; name: string; price: number; category: string; stock: number; description: string; image_url: string; };
type User = { id: string; email: string; full_name?: string; created_at: string; role: string; };
type Message = { id: string; name: string; email: string; subject: string; message: string; created_at: string; };
type Conversation = { id: string; user_email: string; last_message?: string; last_message_at: string; };
type ChatMessage = { id: string; message: string; is_admin: boolean; sender_email: string; created_at: string; };
type Rider = { id: string; full_name: string; email?: string; phone: string; status: string; created_at: string; };
type RiderForm = { full_name: string; email: string; phone: string; status: string; };
const emptyRider: RiderForm = { full_name: "", email: "", phone: "", status: "available" };
type ProductFormState = { name: string; price: string; category: "bouquet" | "keychain"; stock: string; description: string; image_url: string; };

const emptyProduct: ProductFormState = { name: "", price: "", category: "bouquet", stock: "0", description: "", image_url: "" };

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [riderForm, setRiderForm] = useState<RiderForm>(emptyRider);
  const [editRider, setEditRider] = useState<Rider | null>(null);
  const [showRiderForm, setShowRiderForm] = useState(false);
  const [riderSaving, setRiderSaving] = useState(false);

  // Product CRUD state
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [storeName, setStoreName] = useState("Mae Little Loops Studio");
  const [storeEmail, setStoreEmail] = useState("maelittleloops@gmail.com");
  const [storePhone, setStorePhone] = useState("09XXXXXXXXX");
  const [settingsSaved, setSettingsSaved] = useState(false);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select(`id, user_email, total_amount, status, created_at, name, rider_id, rider_name, rider_phone, proof_of_delivery, delivered_at, receipt_url, payment_verified, order_items ( product_name, quantity )`)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  }

  async function handleVerifyPayment(orderId: string) {
    const { error } = await supabase.from("orders").update({ payment_verified: true, status: "Processing" }).eq("id", orderId);
    if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_verified: true, status: "Processing" } : o));
    else alert("Failed to verify payment: " + error.message);
  }

  async function handleUploadProof(orderId: string, customerEmail: string, file: File | undefined) {
    if (!file) return;
    const ext = file.name.split(".").pop();
    const fileName = `proof_${orderId}_${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from("delivery-proofs").upload(fileName, file);
    if (uploadError) { alert("Failed to upload proof: " + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from("delivery-proofs").getPublicUrl(uploadData.path);
    const proofUrl = urlData.publicUrl;
    const deliveredAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("orders").update({
      proof_of_delivery: proofUrl,
      status: "Delivered",
      delivered_at: deliveredAt,
    }).eq("id", orderId);
    if (updateError) { alert("Failed to update order: " + updateError.message); return; }
    const order = orders.find(o => o.id === orderId);
    if (order?.rider_id) {
      await supabase.from("riders").update({ status: "available" }).eq("id", order.rider_id);
      await fetchRiders();
    }
    await fetchOrders();
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: "✅ Order Delivered — Mae Little Loops Studio",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#e91e8c;">Your order has been delivered! ✅</h2>
            <p>Your order from <strong>Mae Little Loops Studio</strong> has been successfully delivered.</p>
            <div style="background:#fce4ec;border-radius:12px;padding:20px;margin:16px 0;">
              <p><strong>Delivered at:</strong> ${new Date(deliveredAt).toLocaleString()}</p>
              <p><strong>Proof of Delivery:</strong></p>
              <img src="${proofUrl}" alt="Proof of Delivery" style="width:100%;border-radius:8px;margin-top:8px;" />
            </div>
            <p style="color:#666;">Thank you for shopping with us! 🌸</p>
            <p style="color:#e91e8c;font-weight:bold;">Mae Little Loops Studio 🌸</p>
          </div>
        `,
      }),
    });
    alert("Proof uploaded! Order marked as Delivered. Customer has been notified.");
  }

  async function handleAssignRider(orderId: string, customerEmail: string, riderId: string) {
    if (!riderId) return;
    const { data: rider, error: riderError } = await supabase.from("riders").select("*").eq("id", riderId).single();
    if (riderError || !rider) { alert("Rider not found."); return; }
    const { error } = await supabase.from("orders").update({
      rider_id: riderId,
      rider_name: rider.full_name,
      rider_phone: rider.phone,
      status: "Shipped",
    }).eq("id", orderId);
    if (error) { alert("Failed to assign rider: " + error.message); return; }
    await supabase.from("riders").update({ status: "busy" }).eq("id", riderId);
    await fetchRiders();
    await fetchOrders();
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: "🏍️ Your Order is On the Way! — Mae Little Loops Studio",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#e91e8c;">Your order is on the way! 🏍️</h2>
            <p>Great news! Your order from <strong>Mae Little Loops Studio</strong> is now being delivered.</p>
            <div style="background:#fce4ec;border-radius:12px;padding:20px;margin:16px 0;">
              <h3 style="color:#c2185b;margin-bottom:12px;">🏍️ Rider Details</h3>
              <p><strong>Name:</strong> ${rider.full_name}</p>
              <p><strong>Phone:</strong> ${rider.phone}</p>
              ${rider.email ? `<p><strong>Email:</strong> ${rider.email}</p>` : ""}
            </div>
            <p>You can contact your rider directly if needed.</p>
            <p style="color:#666;">Thank you for shopping with us! 🌸</p>
            <p style="color:#e91e8c;font-weight:bold;">Mae Little Loops Studio 🌸</p>
          </div>
        `,
      }),
    });
    alert(`Rider ${rider.full_name} assigned! Customer has been notified.`);
  }

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");
      if (error) {
        console.error("Failed to fetch products:", error.message);
        alert("Failed to load products: " + error.message);
        return;
      }
      setProducts((data ?? []) as Product[]);
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
      if (email !== "admin@maelittleloops.com") {
        router.push("/login");
      } else {
        setLoading(false);
        supabase.from("orders").select(`id, user_email, total_amount, status, created_at, name, rider_id, rider_name, rider_phone, proof_of_delivery, delivered_at, receipt_url, payment_verified, order_items ( product_name, quantity )`)
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setOrders(data as Order[]); });
        supabase.from("profiles").select("id, email, full_name, created_at, role")
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setUsers(data as User[]); });
        supabase.from("messages").select("*").order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setMessages(data); });
        fetchProducts();
        supabase.from("riders").select("*").order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setRiders(data as Rider[]); });
        supabase.from("conversations").select("*").order("last_message_at", { ascending: false })
          .then(({ data }) => { if (data) setConversations(data as Conversation[]); });
      }
    });
  }, [router]);

  async function fetchChatMessages(convId: string) {
    const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    setChatMessages((data ?? []) as ChatMessage[]);
  }

  async function handleAdminReply() {
    if (!adminReply.trim() || !activeConv) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const text = adminReply.trim();
    setAdminReply("");
    await supabase.from("chat_messages").insert([{
      conversation_id: activeConv.id,
      sender_id: user.id,
      sender_email: user.email,
      message: text,
      is_admin: true,
    }]);
    await supabase.from("conversations").update({ last_message: text, last_message_at: new Date().toISOString() }).eq("id", activeConv.id);
    fetchChatMessages(activeConv.id);
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c));
  }

  async function fetchRiders() {
    const { data } = await supabase.from("riders").select("*").order("created_at", { ascending: false });
    if (data) setRiders(data as Rider[]);
  }

  async function handleSaveRider() {
    if (!riderForm.full_name.trim() || !riderForm.phone.trim()) {
      alert("Full name and phone number are required."); return;
    }
    setRiderSaving(true);
    if (editRider) {
      const { error } = await supabase.from("riders").update(riderForm).eq("id", editRider.id);
      if (error) { alert("Failed to update rider: " + error.message); }
    } else {
      const { error } = await supabase.from("riders").insert([riderForm]);
      if (error) { alert("Failed to add rider: " + error.message); }
    }
    await fetchRiders();
    setShowRiderForm(false);
    setEditRider(null);
    setRiderForm(emptyRider);
    setRiderSaving(false);
  }

  async function handleStatusChange(riderId: string, newStatus: string) {
    const { error } = await supabase.from("riders").update({ status: newStatus }).eq("id", riderId);
    if (!error) setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
  }

  async function handleDeleteRider(riderId: string) {
    if (!window.confirm("Are you sure you want to delete this rider?")) return;
    const { error } = await supabase.from("riders").delete().eq("id", riderId);
    if (!error) setRiders(prev => prev.filter(r => r.id !== riderId));
    else alert("Failed to delete rider: " + error.message);
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      alert("Failed to delete user: " + error.message);
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) {
      alert("Failed to update role: " + error.message);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function updateOrderStatus(orderId: string, newStatus: string, customerEmail: string) {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { alert("Failed to update status."); return; }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const statusColors: Record<string, string> = { Pending: "#856404", Processing: "#004085", Shipped: "#155724", Delivered: "#0c5460", Cancelled: "#721c24" };
    const color = statusColors[newStatus] || "#c44dff";
    await fetch("/api/send-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail, subject: `Your Order Status Updated — ${newStatus}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#e91e8c;">Mae Little Loops Studio 🌸</h2><p>Your order status has been updated.</p><div style="background:#f9f0ff;border-radius:12px;padding:20px;margin:16px 0;text-align:center;"><span style="background:${color}22;color:${color};padding:6px 20px;border-radius:50px;font-weight:700;font-size:16px;">${newStatus}</span></div><p style="color:#666;">Thank you for shopping with us! 💕</p></div>`,
      }),
    });
  }

  // ===== PRODUCT CRUD =====
  function openCreate() {
    setEditProduct(null);
    setFormData(emptyProduct);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setFormData({ name: p.name, price: String(p.price ?? ""), category: p.category as "bouquet" | "keychain", stock: String(p.stock ?? 0), description: p.description ?? "", image_url: p.image_url ?? "" });
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
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-line" style={{marginBottom:'12px'}} />)}
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: "🛍️", color: "#f48fb1" },
    { label: "Total Orders", value: orders.length.toString(), icon: "📦", color: "#81d4fa" },
    { label: "Total Users", value: users.length.toString(), icon: "👥", color: "#a5d6a7" },
    { label: "Total Riders", value: riders.length.toString(), icon: "🏍️", color: "#b39ddb" },
    { label: "Revenue", value: "₱" + orders.filter(o => o.status?.toLowerCase() === "delivered").reduce((s, o) => s + (o.total_amount ?? 0), 0).toLocaleString(), icon: "💰", color: "#ffcc80" },
  ];

  const navItems = [
    { label: "Dashboard", icon: "📊" },
    { label: "Products", icon: "🛍️" },
    { label: "Orders", icon: "📦" },
    { label: "Users", icon: "👥" },
    { label: "Riders", icon: "🏍️" },
    { label: "Chats", icon: "💬" },
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
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <button className="logout-item" onClick={handleLogout}><span>🚪</span> Logout</button>
      </aside>

      {/* MAIN */}
      <main className="admin-main">

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
                  <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value}</p></div>
                </div>
              ))}
            </div>
            <div className="admin-table-card">
              <div className="table-header"><h2>Recent Orders</h2><span className="table-badge">{orders.length} orders</span></div>
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No orders yet.</td></tr> :
                    orders.slice(0,4).map((o) => (
                      <tr key={o.id}>
                        <td className="order-id">#{o.id.slice(0,8)}...</td>
                        <td>{o.user_email}</td>
                        <td>{o.order_items?.[0]?.product_name ?? "—"}</td>
                        <td className="order-price">₱{o.total_amount?.toFixed(2)}</td>
                        <td><span className={`status-badge ${o.status?.toLowerCase() === "delivered" ? "done" : o.status?.toLowerCase() === "shipped" ? "shipped" : "pending"}`}>{o.status}</span></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== PRODUCTS CRUD ===== */}
        {active === "Products" && (
          <>
            {/* PRODUCT FORM MODAL */}
            {showForm && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setShowForm(false)}>
                <div style={{background:'white',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'480px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
                  <h3 style={{fontSize:'18px',fontWeight:'700',marginBottom:'20px',color:'#222'}}>{editProduct ? "Edit Product" : "Add New Product"}</h3>
                  <div className="settings-form">
                    <div className="settings-group">
                      <label>Product Name *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Rainbow Tulip Charm" />
                    </div>
                    <div style={{display:'flex',gap:'12px'}}>
                      <div className="settings-group" style={{flex:1}}>
                        <label>Price (₱) *</label>
                        <input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                      </div>
                      <div className="settings-group" style={{flex:1}}>
                        <label>Stock</label>
                        <input type="number" min="0" step="1" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="0" />
                      </div>
                    </div>
                    <div className="settings-group">
                      <label>Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as "bouquet" | "keychain"})} style={{padding:'12px 16px',border:'1.5px solid #fce4ec',borderRadius:'12px',background:'#fff9fb',fontSize:'14px',outline:'none'}}>
                        <option value="bouquet">Bouquet</option>
                        <option value="keychain">Keychain</option>
                      </select>
                    </div>
                    <div className="settings-group">
                      <label>Image URL</label>
                      <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="/Rainbow Tulip Charm.png" />
                    </div>
                    <div className="settings-group">
                      <label>Description <span style={{fontWeight:'400',color:'#aaa',fontSize:'12px'}}>(optional)</span></label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Product description..." rows={3} style={{padding:'12px 16px',border:'1.5px solid #fce4ec',borderRadius:'12px',background:'#fff9fb',fontSize:'14px',outline:'none',resize:'vertical',fontFamily:'inherit'}} />
                    </div>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button className="save-btn" onClick={handleSaveProduct} disabled={saving} style={{flex:1}}>{saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}</button>
                      <button onClick={() => setShowForm(false)} style={{flex:1,padding:'13px',border:'1.5px solid #fce4ec',borderRadius:'12px',background:'white',color:'#888',fontWeight:'600',cursor:'pointer',fontSize:'14px'}}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-table-card">
              <div className="table-header">
                <h2>All Products</h2>
                <span className="table-badge">{products.length} products</span>
                <button onClick={openCreate} style={{marginLeft:'auto',padding:'8px 20px',border:'none',borderRadius:'50px',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',color:'white',fontWeight:'700',fontSize:'13px',cursor:'pointer',boxShadow:'0 4px 12px rgba(196,77,255,0.3)'}}>+ Add Product</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No products yet.</td></tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td><img src={p.image_url || '/Rainbow Tulip Charm.png'} alt={p.name} width={48} height={48} style={{objectFit:'contain',borderRadius:'8px'}} /></td>
                        <td>{p.name}</td>
                        <td><span className={`cat-badge ${p.category === "bouquet" ? "bouquet" : "keychain"}`}>{p.category}</span></td>
                        <td className="order-price">₱{parseFloat(String(p.price)).toFixed(2)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <div style={{display:'flex',gap:'8px'}}>
                            <button onClick={() => openEdit(p)} style={{padding:'5px 14px',borderRadius:'20px',border:'1.5px solid #c44dff',background:'white',color:'#c44dff',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Edit</button>
                            <button onClick={() => handleDeleteProduct(p.id)} disabled={deleteId === p.id} style={{padding:'5px 14px',borderRadius:'20px',border:'1.5px solid #e91e8c',background:'white',color:'#e91e8c',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>{deleteId === p.id ? "..." : "Delete"}</button>
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

        {/* ===== ORDERS ===== */}
        {active === "Orders" && (
          <>
            {/* Receipt preview modal */}
            {previewReceipt && (
              <div onClick={() => setPreviewReceipt(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{position:'relative'}} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPreviewReceipt(null)} style={{position:'absolute',top:'-14px',right:'-14px',background:'#e91e8c',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'white',fontSize:'16px',cursor:'pointer',fontWeight:'700',zIndex:1}}>✕</button>
                  <img src={previewReceipt} alt="GCash Receipt" style={{maxWidth:'90vw',maxHeight:'80vh',borderRadius:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.4)',display:'block'}} />
                </div>
              </div>
            )}
            <div className="admin-table-card">
              <div className="table-header"><h2>All Orders</h2><span className="table-badge">{orders.length} orders</span></div>
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>GCash Receipt</th><th>Rider</th><th>Proof</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={9} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No orders yet.</td></tr> :
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td className="order-id">#{o.id.slice(0,8)}...</td>
                        <td>{o.user_email}</td>
                        <td>{o.order_items?.[0]?.product_name ?? "—"}</td>
                        <td className="order-price">₱{o.total_amount?.toFixed(2)}</td>
                        <td>
                          <select className="status-select" value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value, o.user_email)}>
                            <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                          </select>
                        </td>
                        <td>
                          {o.receipt_url ? (
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                              <img
                                src={o.receipt_url} alt="GCash Receipt"
                                onClick={() => setPreviewReceipt(o.receipt_url!)}
                                width={64} height={64}
                                style={{objectFit:'cover',borderRadius:'8px',border:'2px solid #fce4ec',cursor:'pointer'}}
                              />
                              <button
                                onClick={() => handleVerifyPayment(o.id)}
                                style={{padding:'4px 8px',borderRadius:'6px',border:'none',background:o.payment_verified ? '#e8f5e9' : '#fce4ec',color:o.payment_verified ? '#2e7d32' : '#e91e8c',fontWeight:'600',cursor:'pointer',fontSize:'11px',whiteSpace:'nowrap'}}
                              >
                                {o.payment_verified ? '✅ Verified' : '⏳ Verify'}
                              </button>
                            </div>
                          ) : (
                            <span style={{color:'#aaa',fontSize:'12px'}}>No receipt</span>
                          )}
                        </td>
                        <td>
                          {o.rider_name ? (
                            <div>
                              <p style={{fontWeight:'600',color:'#e91e8c',margin:0}}>{o.rider_name}</p>
                              <p style={{fontSize:'12px',color:'#777',margin:0}}>{o.rider_phone}</p>
                            </div>
                          ) : (
                            <select
                              value={o.rider_id || ""}
                              onChange={(e) => handleAssignRider(o.id, o.user_email, e.target.value)}
                              style={{padding:'6px 10px',borderRadius:'8px',border:'1.5px solid #fce4ec',color:'#e91e8c',fontWeight:'600',cursor:'pointer',fontSize:'12px'}}
                            >
                              <option value="">— Assign Rider —</option>
                              {riders.filter(r => r.status === 'available').map(r => (
                                <option key={r.id} value={r.id}>{r.full_name} ({r.phone})</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>
                          {o.proof_of_delivery ? (
                            <div>
                              <a href={o.proof_of_delivery} target="_blank" rel="noopener noreferrer">
                                <img src={o.proof_of_delivery} alt="Proof" width={56} height={56} style={{objectFit:'cover',borderRadius:'8px',border:'2px solid #fce4ec'}} />
                              </a>
                              {o.delivered_at && <p style={{fontSize:'11px',color:'#777',margin:'4px 0 0'}}>{new Date(o.delivered_at).toLocaleString()}</p>}
                            </div>
                          ) : o.status?.toLowerCase() === 'shipped' ? (
                            <div>
                              <input type="file" accept="image/*" id={`proof-${o.id}`} style={{display:'none'}} onChange={(e) => handleUploadProof(o.id, o.user_email, e.target.files?.[0])} />
                              <label htmlFor={`proof-${o.id}`} style={{padding:'6px 10px',borderRadius:'8px',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',cursor:'pointer',fontWeight:'600',fontSize:'12px',whiteSpace:'nowrap'}}>📷 Upload Proof</label>
                            </div>
                          ) : (
                            <span style={{color:'#ccc',fontSize:'12px'}}>—</span>
                          )}
                        </td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== USERS ===== */}
        {active === "Users" && (
          <div className="admin-table-card">
            <div className="table-header"><h2>All Users</h2><span className="table-badge">{users.length} users</span></div>
            <table className="admin-table">
              <thead><tr><th>Email</th><th>Full Name</th><th>Role</th><th>Date Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No users yet.</td></tr> :
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.full_name || '—'}</td>
                      <td>
                        <select
                          value={u.role || 'customer'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{padding:'6px 12px',borderRadius:'8px',border:'1.5px solid #fce4ec',color:'#e91e8c',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDeleteUser(u.id)} style={{padding:'5px 14px',borderRadius:'20px',border:'none',background:'#ffebee',color:'#c62828',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* ===== RIDERS ===== */}
        {active === "Riders" && (
          <>
            {showRiderForm && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => { setShowRiderForm(false); setEditRider(null); setRiderForm(emptyRider); }}>
                <div style={{background:'white',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
                  <h3 style={{fontSize:'18px',fontWeight:'700',marginBottom:'20px',color:'#222'}}>{editRider ? "Edit Rider" : "Add New Rider"}</h3>
                  <div className="settings-form">
                    <div className="settings-group">
                      <label>Full Name *</label>
                      <input type="text" value={riderForm.full_name} onChange={e => setRiderForm({...riderForm, full_name: e.target.value})} placeholder="e.g. Juan Dela Cruz" />
                    </div>
                    <div className="settings-group">
                      <label>Email <span style={{fontWeight:'400',color:'#aaa',fontSize:'12px'}}>(optional)</span></label>
                      <input type="email" value={riderForm.email} onChange={e => setRiderForm({...riderForm, email: e.target.value})} placeholder="rider@email.com" />
                    </div>
                    <div className="settings-group">
                      <label>Phone Number *</label>
                      <input type="text" value={riderForm.phone} onChange={e => setRiderForm({...riderForm, phone: e.target.value})} placeholder="09XXXXXXXXX" />
                    </div>
                    <div className="settings-group">
                      <label>Status</label>
                      <select value={riderForm.status} onChange={e => setRiderForm({...riderForm, status: e.target.value})} style={{padding:'12px 16px',border:'1.5px solid #fce4ec',borderRadius:'12px',background:'#fff9fb',fontSize:'14px',outline:'none'}}>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button className="save-btn" onClick={handleSaveRider} disabled={riderSaving} style={{flex:1}}>{riderSaving ? "Saving..." : editRider ? "Update Rider" : "Add Rider"}</button>
                      <button onClick={() => { setShowRiderForm(false); setEditRider(null); setRiderForm(emptyRider); }} style={{flex:1,padding:'13px',border:'1.5px solid #fce4ec',borderRadius:'12px',background:'white',color:'#888',fontWeight:'600',cursor:'pointer',fontSize:'14px'}}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="admin-table-card">
              <div className="table-header">
                <h2>All Riders</h2>
                <span className="table-badge">{riders.length} riders</span>
                <button onClick={() => { setEditRider(null); setRiderForm(emptyRider); setShowRiderForm(true); }} style={{marginLeft:'auto',padding:'8px 20px',border:'none',borderRadius:'50px',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',color:'white',fontWeight:'700',fontSize:'13px',cursor:'pointer',boxShadow:'0 4px 12px rgba(196,77,255,0.3)'}}>+ Add Rider</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {riders.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No riders yet.</td></tr>
                  ) : (
                    riders.map((r) => (
                      <tr key={r.id}>
                        <td>{r.full_name}</td>
                        <td>{r.email || '—'}</td>
                        <td>{r.phone}</td>
                        <td>
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            style={{padding:'6px 12px',borderRadius:'8px',border:'1.5px solid #fce4ec',color: r.status === 'available' ? '#2e7d32' : r.status === 'busy' ? '#e91e8c' : '#aaa',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}
                          >
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="offline">Offline</option>
                          </select>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:'8px'}}>
                            <button onClick={() => { setEditRider(r); setRiderForm({ full_name: r.full_name, email: r.email ?? "", phone: r.phone, status: r.status }); setShowRiderForm(true); }} style={{padding:'5px 14px',borderRadius:'20px',border:'1.5px solid #c44dff',background:'white',color:'#c44dff',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Edit</button>
                            <button onClick={() => handleDeleteRider(r.id)} style={{padding:'5px 14px',borderRadius:'20px',border:'none',background:'#ffebee',color:'#c62828',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Delete</button>
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

        {/* ===== CHATS ===== */}
        {active === "Chats" && (
          <div style={{display:'flex',gap:'16px',height:'560px'}}>
            {/* Conversation list */}
            <div className="admin-table-card" style={{width:'280px',flexShrink:0,overflowY:'auto',padding:'16px'}}>
              <h3 style={{margin:'0 0 12px',fontSize:'15px',fontWeight:'700'}}>Conversations <span className="table-badge">{conversations.length}</span></h3>
              {conversations.length === 0 ? <p style={{color:'#aaa',fontSize:'13px'}}>No conversations yet.</p> :
                conversations.map(c => (
                  <div key={c.id} onClick={() => { setActiveConv(c); fetchChatMessages(c.id); }} style={{padding:'12px',borderRadius:'12px',cursor:'pointer',background:activeConv?.id === c.id ? '#fce4ec' : '#fff9fb',border:'1.5px solid #fce4ec',marginBottom:'8px'}}>
                    <p style={{fontWeight:'600',fontSize:'13px',margin:'0 0 4px',color:'#e91e8c'}}>{c.user_email}</p>
                    <p style={{fontSize:'12px',color:'#888',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.last_message || 'No messages yet'}</p>
                    <p style={{fontSize:'11px',color:'#bbb',margin:'4px 0 0'}}>{new Date(c.last_message_at).toLocaleString()}</p>
                  </div>
                ))
              }
            </div>
            {/* Chat window */}
            <div className="admin-table-card" style={{flex:1,display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}}>
              {!activeConv ? (
                <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',flexDirection:'column',gap:'8px'}}>
                  <span style={{fontSize:'40px'}}>💬</span>
                  <p>Select a conversation to view messages</p>
                </div>
              ) : (
                <>
                  <div style={{padding:'16px 20px',borderBottom:'1px solid #fce4ec',background:'#fff9fb'}}>
                    <p style={{fontWeight:'700',margin:0,color:'#e91e8c'}}>{activeConv.user_email}</p>
                  </div>
                  <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
                    {chatMessages.length === 0 && <p style={{color:'#aaa',fontSize:'13px',textAlign:'center',marginTop:'20px'}}>No messages yet.</p>}
                    {chatMessages.map(msg => (
                      <div key={msg.id} style={{alignSelf:msg.is_admin ? 'flex-end' : 'flex-start',background:msg.is_admin ? 'linear-gradient(135deg,#e91e8c,#f06292)' : '#fce4ec',color:msg.is_admin ? 'white' : '#333',padding:'10px 14px',borderRadius:msg.is_admin ? '12px 4px 12px 12px' : '4px 12px 12px 12px',maxWidth:'75%',fontSize:'14px'}}>
                        <p style={{margin:0}}>{msg.message}</p>
                        <p style={{margin:'4px 0 0',fontSize:'11px',opacity:0.65}}>{msg.is_admin ? 'Admin' : msg.sender_email} · {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'12px 16px',borderTop:'1px solid #fce4ec',display:'flex',gap:'8px'}}>
                    <input
                      type="text" value={adminReply}
                      onChange={e => setAdminReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAdminReply(); }}
                      placeholder="Type a reply..."
                      style={{flex:1,padding:'10px 14px',borderRadius:'50px',border:'1.5px solid #fce4ec',outline:'none',fontSize:'14px',fontFamily:'inherit'}}
                    />
                    <button onClick={handleAdminReply} style={{background:'linear-gradient(135deg,#e91e8c,#f06292)',border:'none',borderRadius:'50%',width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'16px',flexShrink:0}}>➤</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {active === "Messages" && (
          <div className="admin-table-card">
            <div className="table-header"><h2>Messages</h2><span className="table-badge">{messages.length} messages</span></div>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th></tr></thead>
              <tbody>
                {messages.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#aaa',padding:'24px'}}>No messages yet.</td></tr> :
                  messages.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td><td>{m.email}</td><td>{m.subject}</td>
                      <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.message}</td>
                      <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                }
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
              <div className="settings-group"><label>Store Name</label><input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} /></div>
              <div className="settings-group"><label>Email</label><input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} /></div>
              <div className="settings-group"><label>Phone Number</label><input type="text" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} /></div>
              <button className="save-btn" onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}>Save Changes</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
