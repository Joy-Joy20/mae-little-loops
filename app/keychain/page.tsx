"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type Product = { id: string; name: string; price: string; img: string | null; };

export default function Keychain() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [keychains, setKeychains] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    supabase.from("products").select("id, name, price, img").eq("category", "keychain").then(({ data }) => {
      if (data) setKeychains(data);
    });
  }, []);

  async function handleAddToCart(name: string, price: string, img: string | null) {
    if (!userEmail) return router.push("/login");
    await addToCart({ name, price, img });
    alert(`${name} added to cart!`);
  }

  async function handleBuyNow(name: string, price: string, img: string | null) {
    if (!userEmail) return router.push("/login");
    await addToCart({ name, price, img });
    router.push("/checkout");
  }

  return (
    <main className="keychain-page">
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') router.push(`/search?q=${(e.target as HTMLInputElement).value}`); }} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="logout-btn">Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer'}}>
            🛒{cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item"><span>💐</span><p>Bouquets</p></a>
        <a href="/keychain" className="category-item active-cat"><span>🔑</span><p>Keychain</p></a>
      </div>

      <div className="description-banner">
        <p>Handmade with love 🔑 — Cute and adorable keychains perfect as gifts or daily accessories.</p>
      </div>

      <section className="products-section">
        <h2 className="section-title">Our Keychains</h2>
        <div className="products-grid">
          {keychains.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-img-wrapper" onClick={() => router.push(`/product/${item.id}`)} style={{cursor:'pointer'}}>
                {item.img ? (
                  <Image src={item.img} alt={item.name} width={140} height={140} className="product-img" />
                ) : (
                  <div style={{fontSize:'60px', lineHeight:'1'}}>🔑</div>
                )}
              </div>
              <h3 className="product-name" onClick={() => router.push(`/product/${item.id}`)} style={{cursor:'pointer'}}>{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <div className="btn-row">
                <button className="add-btn" onClick={() => handleAddToCart(item.name, item.price, item.img)}>Add to Cart</button>
                <button className="buy-btn" onClick={() => handleBuyNow(item.name, item.price, item.img)}>Buy Now</button>
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
