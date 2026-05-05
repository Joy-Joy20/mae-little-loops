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
          
          <a href="/bouquets">Products</a>
          <a href="/about_us" className="active-link">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Profile</a> : <a href="/login">Sign In</a>}
        </nav>
        <div className="nav-right">
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if(q) window.location.href = `/search?q=${encodeURIComponent(q)}`; }}} />
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
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p>
          <div style={{display:"flex",gap:"12px",marginTop:"12px"}}>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer" title="Facebook" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@mae.littleloops" target="_blank" rel="noopener noreferrer" title="TikTok" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
            <a href="mailto:masarquemae65@gmail.com" title="Email" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>masarquemae65@gmail.com</p><p>09706383306</p><p>Masbate, Philippines</p></div>
        <div className="footer-bottom" style={{gridColumn:'1/-1',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'16px',fontSize:'13px',opacity:0.8}}>
          &copy; {new Date().getFullYear()} Mae Little Loops Studio. All Rights Reserved.
        </div>
      </footer>




    </main>
  );
}
