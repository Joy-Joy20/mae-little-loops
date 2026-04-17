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

      {/* HEADER */}
      <header>
        <h1>Mae Little Loops Studio</h1>

        <nav>
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>

        <div className="right-section">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`;
              }
            }}
          />

          {userEmail ? (
            <div className="user-box">
              <span>👤 {userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon">👤</a>
          )}

          <span onClick={() => window.location.href='/cart'}>
            🛒
            {cart.length > 0 && <sup className="cart-badge">{cart.length}</sup>}
          </span>
        </div>
      </header>

      {/* CATEGORY */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">💐 <p>Bouquets</p></a>
        <a href="/keychain" className="category-item">🔑 <p>Keychain</p></a>
      </div>

      {/* HERO */}
      <div className="hero-banner">
        <div className="hero-text">
          <h2>Handmade with Love 🌸</h2>
          <p>Explore our beautiful collection of crochet bouquets and keychains.</p>
          <a href="/bouquets" className="hero-btn">Shop Now</a>
        </div>

        <div className="carousel">
          <Image src={slides[current].img} alt="" width={220} height={220} />
          <button onClick={prev} className="carousel-btn prev">&#8249;</button>
          <button onClick={next} className="carousel-btn next">&#8250;</button>
        </div>
      </div>

      {/* ✅ FIXED FEATURED PRODUCTS */}
      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>

        <div className="products-grid">
          {products.map((item, index) => (
            <div key={index} className="product-card">
              <Image src={item.img} alt={item.name} width={160} height={160} />
              <h3>{item.name}</h3>
              <p className="price">{item.price}</p>
              <button onClick={() => window.location.href='/bouquets'}>Shop Now</button>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}