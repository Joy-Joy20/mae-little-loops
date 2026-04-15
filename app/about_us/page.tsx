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

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us" className="active-link">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>

        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
              <button onClick={handleLogout} style={{fontSize:'12px', padding:'4px 10px', borderRadius:'20px', border:'none', background:'#ff1493', color:'white', cursor:'pointer'}}>Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => window.location.href='/cart'} style={{cursor:'pointer'}}>🛒 {cart.length > 0 && <sup style={{background:'#ff1493', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}</span>
        </div>
      </header>

      {/* CATEGORY ICONS */}
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

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      {/* ABOUT CONTENT */}
      <section className="about-content">

        <div className="about-card">
          <h2>About Us 🌸</h2>
          <p>
            Mae Little Loops Studio is a small handmade business that specializes in beautiful crochet bouquets and adorable keychains.
            Every piece is crafted with love, care, and attention to detail — perfect as gifts or personal keepsakes.
            We believe that handmade items carry a special warmth that no store-bought product can replace.
          </p>
        </div>

        <div className="about-card">
          <h2>Meet the Owner 👩‍🎨</h2>
          <p><strong>Mae Masarque</strong></p>
          <p>The heart and hands behind Mae Little Loops Studio. Passionate about crochet and bringing smiles through handmade creations.</p>
        </div>



      </section>

      {/* FOOTER */}
      <footer className="bg-pink-300 py-10 px-10 flex justify-around items-start flex-wrap gap-8">
        <div>
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          <h2 className="font-bold mt-2">Mae Little Loops Studio</h2>
        </div>
        <div className="text-center">
          <h3 className="font-bold mb-2">🌸 Special Bouquets</h3>
          <ul className="list-none">
            <li>Cute keychains</li>
            <li>Special Gift Gifts</li>
          </ul>
        </div>
        <div>
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
        </div>
      </footer>

    </main>
  );
}
