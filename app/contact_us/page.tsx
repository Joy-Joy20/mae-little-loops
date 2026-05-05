"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";

export default function ContactUs() {
  const [userEmail, setUserEmail] = useState("");
  const { cart } = useCart();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        const { data: profile } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) setName(profile.full_name);
      }
    };
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert([{ name, email: userEmail, subject, message }]);
      if (error) throw new Error(error.message);
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: userEmail, subject, message }),
      });
      setSent(true);
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setSending(false);
  }

  return (
    <main className="contact-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us" className="active-link">Contact Us</a>
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
        <p>We&apos;d love to hear from you! Reach out for orders, inquiries, or just to say hi 🌸</p>
      </div>

      {/* CONTACT CONTENT */}
      <section className="contact-content">

        {/* GET IN TOUCH */}
        <div className="contact-info-card">
          <h2>Get in Touch</h2>
          <div className="info-item"><span className="info-icon">📧</span><p>masarquemae65@gmail.com</p></div>
          <div className="info-item"><span className="info-icon">📱</span><p>09706383306</p></div>
          <div className="info-item"><span className="info-icon">📍</span><p>Masbate, Philippines</p></div>
          <div className="info-item"><span className="info-icon">⏰</span><p>Mon - Sat, 8:00 AM - 6:00 PM</p></div>
          <div className="info-item"><span className="info-icon">🚚</span><p>Available within Masbate</p></div>
          <div className="info-item"><span className="info-icon">💳</span><p>Cash on Delivery / GCash</p></div>
          <div className="info-item">
            <span className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </span>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer">Mae Orayan Masarque</a>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="contact-form-card">
          <h2>Send a Message</h2>
          <p className="contact-sub">May tanong o mensahe? Mag-message lang!</p>

          {sent ? (
            <div className="success-msg">
              <p>✅ Message sent!</p>
              <p>We will get back to you soon 🌸</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  readOnly={!!userEmail}
                  style={{ background: userEmail ? '#f9f9f9' : 'white', cursor: userEmail ? 'not-allowed' : 'text' }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="What is this about?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="Write your message here..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
              <button type="submit" disabled={sending}>{sending ? "Sending..." : "Send Message"}</button>
            </form>
          )}
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

