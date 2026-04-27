"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import BuyNowModal from "../../components/BuyNowModal";

type Product = { id: string; name: string; price: string; img: string | null; category: string; };

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [bouquets, setBouquets] = useState<Product[]>([]);
  const [buyNowProduct, setBuyNowProduct] = useState<{name:string; price:string; img:string|null}|null>(null);
  const [activeTab, setActiveTab] = useState("bouquet");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    supabase.from("products").select("id, name, price, img, category").then(({ data }) => {
      if (data) setBouquets(data);
    });
  }, []);

  const filtered = activeTab === "all" ? bouquets : bouquets.filter(p => p.category === activeTab);

  async function handleAddToCart(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    await addToCart({ name, price, img });
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    setBuyNowProduct({ name, price, img });
  }

  return (
    <main className="bouquets-page">
      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <>
              <span className="nav-user" onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login'; }} className="logout-btn">Logout</button>
            </>
          ) : (
            <a href="/login" className="login-icon">👤</a>
          )}
          <span onClick={() => router.push('/cart')} className="cart-icon">
            🛒{cart.length > 0 && <sup className="cart-badge">{cart.length}</sup>}
          </span>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">💐 Bouquets</a>
        <a href="/keychain" className="category-item">🔑 Keychain</a>
      </div>

      {/* HERO BANNER */}
      <div className="page-hero">
        <h2>Our Products</h2>
        <p>Handmade with love 🌸 — Explore our beautiful collection of crochet bouquets and adorable keychains, perfect for any occasion.</p>
      </div>

      {/* FILTER TABS */}
      <div className="filter-tabs">
        {[{key:"all",label:"All"},{key:"bouquet",label:"💐 Bouquets"},{key:"keychain",label:"🔑 Keychains"}].map(tab => (
          <button key={tab.key} className={`filter-tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      <section className="products-section">
        <div className="products-grid">
          {filtered.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-img-wrapper">
                {item.img ? (
                  <Image src={item.img} alt={item.name} fill className="product-img" />
                ) : (
                  <div className="product-img-placeholder">{item.category === "bouquet" ? "🌸" : "🔑"}</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price}</p>
                <div className="btn-row">
                  <button className="add-btn" onClick={() => handleAddToCart(item.name, item.price, item.img ?? null)}>Add to Cart</button>
                  <button className="buy-btn" onClick={() => handleBuyNow(item.name, item.price, item.img ?? null)}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={180} height={180} style={{objectFit:'contain', display:'block'}} />
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p><p>📍 Cebu City, Philippines</p></div>
      </footer>
    </main>
  );
}
