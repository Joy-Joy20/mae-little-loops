"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function ContactUs() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart } = useCart();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("messages").insert([{ name, email, subject, message }]);
    setSending(false);
    if (!error) setSent(true);
  }

  return (
    <main className="contact-page">

      {/* NAVBAR */}
      <header>
        <h1>Mae Sister's Bouquet</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us" className="active-link">Contact Us</a>
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

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>We&apos;d love to hear from you! Reach out for orders, inquiries, or just to say hi 🌸</p>
      </div>

      {/* CONTACT CONTENT */}
      <section className="contact-content">

        {/* GET IN TOUCH */}
        <div className="contact-info-card">
          <h2>Get in Touch</h2>
          <div className="info-item"><span className="info-icon">📧</span><p>maelittleloops@gmail.com</p></div>
          <div className="info-item"><span className="info-icon">📱</span><p>09XXXXXXXXX</p></div>
          <div className="info-item"><span className="info-icon">📍</span><p>Cebu City, Philippines</p></div>
          <div className="info-item"><span className="info-icon">⏰</span><p>Mon - Sat, 8:00 AM - 6:00 PM</p></div>
          <div className="info-item"><span className="info-icon">🚚</span><p>Available within Cebu City</p></div>
          <div className="info-item"><span className="info-icon">💳</span><p>Cash on Delivery / GCash</p></div>
          <div className="info-item">
            <span className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </span>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank">Mae Orayan Masarque</a>
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
                <input type="text" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
