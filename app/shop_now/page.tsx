"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function ShopNow() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart } = useCart();
  const [current, setCurrent] = useState(0);

  const slides = [
    { img: "/Rainbow Tulip Charm.png", alt: "Rainbow Tulip Charm" },
    { img: "/Pastel Blossom Bouquet.png", alt: "Pastel Blossom Bouquet" },
    { img: "/Lavender Bell Flowers.png", alt: "Lavender Bell Flowers" },
    { img: "/Mini White Pastel Flower Bouquet.png", alt: "Mini White Pastel Flower Bouquet" },
  ];

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const products = [
    { name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
    { name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
    { name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
    { name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    window.location.href = "/login";
  }

  return (
    <main className="shop-page">

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => window.location.href='/cart'} style={{cursor:'pointer'}}>🛒 {cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}</span>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">
          <span>💐</span>
          <p>Bouquets</p>
        </a>
        <a href="/keychain" className="category-item">
          <span>🔑</span>
          <p>Keychain</p>
        </a>
      </div>

      {/* HERO BANNER */}
      <div className="hero-banner">
        <div className="hero-text">
          <h2>Handmade with Love 🌸</h2>
          <p>Explore our beautiful collection of crochet bouquets and adorable keychains — perfect for gifts or personal keepsakes.</p>
          <a href="/bouquets" className="hero-btn">Shop Now</a>
        </div>

        {/* CAROUSEL */}
        <div className="carousel">
          <Image src={slides[current].img} alt={slides[current].alt} width={280} height={280} className="carousel-img" />
          <button className="carousel-btn prev" onClick={prev}>&#8249;</button>
          <button className="carousel-btn next" onClick={next}>&#8250;</button>
          <div className="carousel-dots">
            {slides.map((_, i) => (
              <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>
        <div className="products-grid">
          {products.map((item, index) => (
            <div key={index} className="product-card">
              <div className="product-img-wrapper">
                <Image src={item.img} alt={item.name} width={160} height={160} className="product-img" />
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="product-price">{item.price}</p>
                <button className="shop-btn" onClick={() => window.location.href='/bouquets'}>Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={70} height={70} style={{borderRadius:'12px'}} />
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col">
          <h3>Categories</h3>
          <a href="/bouquets">Bouquets</a>
          <a href="/keychain">Keychains</a>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>📧 maelittleloops@gmail.com</p>
          <p>📱 09XXXXXXXXX</p>
          <p>📍 Cebu City, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
