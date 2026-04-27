"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function AboutUs() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="about-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us" className="active-link">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => window.location.href='/dashboard'}>👤 {userEmail.split('@')[0]}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => window.location.href='/cart'} style={{cursor:'pointer', color:'white'}}>
            🛒 {cart.length > 0 && <sup style={{background:'white', color:'#c44dff', borderRadius:'50%', padding:'1px 5px', fontSize:'10px', fontWeight:'bold'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item"><span>💐</span> Bouquets</a>
        <a href="/keychain" className="category-item"><span>🔑</span> Keychain</a>
      </div>

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      {/* ABOUT CONTENT */}
      <section className="about-content">

        {/* ABOUT US CARD */}
        <div className="about-card">
          <span style={{fontSize:'40px'}}>🌸</span>
          <h2>About Us</h2>
          <p>
            Mae Little Loops Studio is a small handmade business that specializes in beautiful crochet bouquets and adorable keychains.
            Every piece is crafted with love, care, and attention to detail — perfect as gifts or personal keepsakes.
            We believe that handmade items carry a special warmth that no store-bought product can replace.
          </p>
        </div>

        {/* MEET THE OWNER CARD */}
        <div className="about-card owner-card">
          <Image src="/owner.jpg" alt="Mae Masarque" width={130} height={130} className="owner-img" />
          <h2>Meet the Owner</h2>
          <p className="owner-name">Mae Masarque</p>
          <p>The heart and hands behind Mae Little Loops Studio. Passionate about crochet and bringing smiles through handmade creations.</p>
        </div>

      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={70} height={70} style={{borderRadius:'12px'}} />
          <h3>Mae Sister's Bouquet</h3>
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
