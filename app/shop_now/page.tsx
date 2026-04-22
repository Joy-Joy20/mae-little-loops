"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type Product = { id: string; name: string; price: string; img: string | null; };

export default function ShopNow() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    supabase.from("products").select("id, name, price, img").limit(4).then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/login");
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const sanitized = searchQuery.trim().replace(/[<>"']/g, "");
      if (sanitized) router.push(`/search?q=${encodeURIComponent(sanitized)}`);
    }
  }

  return (
    <main className="shop-page">
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input type="text" placeholder="Search..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>
            🛒 {cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item"><span>💐</span><p>Bouquets</p></a>
        <a href="/keychain" className="category-item"><span>🔑</span><p>Keychain</p></a>
      </div>

      <div className="home-desc-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>
        <p className="products-desc">Discover our handmade crochet bouquets and keychains — crafted with love and perfect for every occasion. 🌸</p>
        <div className="products-grid">
          {products.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-img-wrapper" onClick={() => router.push(`/product/${item.id}`)} style={{cursor:'pointer'}}>
                {item.img ? (
                  <Image src={item.img} alt={item.name} width={180} height={180} className="product-img" />
                ) : (
                  <div style={{fontSize:'60px', lineHeight:'1'}}>🌸</div>
                )}
              </div>
              <div className="product-info">
                <h3 onClick={() => router.push(`/product/${item.id}`)} style={{cursor:'pointer'}}>{item.name}</h3>
                <p className="product-price">{item.price}</p>
                <button className="shop-btn" onClick={() => router.push(`/product/${item.id}`)}>Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={100} height={100} style={{borderRadius:'12px', objectFit:'contain'}} />
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p><p>📍 Cebu City, Philippines</p></div>
      </footer>
    </main>
  );
}
