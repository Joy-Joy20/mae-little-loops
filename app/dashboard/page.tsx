"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment: string;
  name: string;
  address: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? null);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (orderData) setOrders(orderData);
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
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

  return (
    <main className="dash-page">

      <header>
        <h1>Mae Sister's Bouquet</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>🛒</span>
        </div>
      </header>

      <div className="dash-content">

        {/* PROFILE CARD */}
        <div className="dash-profile">
          <div className="dash-avatar">👤</div>
          <div>
            <h2 className="dash-name">{userEmail}</h2>
            <p className="dash-role">Customer</p>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* ORDERS */}
        <div className="dash-section">
          <h2 className="dash-section-title">My Orders</h2>

          {orders.length === 0 ? (
            <div className="dash-empty">
              <p>You have no orders yet.</p>
              <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
            </div>
          ) : (
            <div className="dash-orders">
              {orders.map((order) => (
                <div key={order.id} className="dash-order-card">
                  <div className="dash-order-header">
                    <span className="dash-order-id">Order #{order.id.slice(0, 8)}...</span>
                    <span className={`dash-order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="dash-order-details">
                    <div className="dash-order-row"><span>Total</span><strong>₱{order.total_amount?.toFixed(2)}</strong></div>
                    <div className="dash-order-row"><span>Payment</span><span>{order.payment}</span></div>
                    <div className="dash-order-row"><span>Deliver to</span><span>{order.address}</span></div>
                    <div className="dash-order-row"><span>Date</span><span>{new Date(order.created_at).toLocaleDateString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <footer>
        <div className="footer-col"><h3>Mae Sister's Bouquet</h3><p>Handmade with love 🌸</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p></div>
      </footer>

    </main>
  );
}
