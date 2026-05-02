"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
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
        // full_name column not available in users table — skip profile name prefill
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
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us" className="active-link">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
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
        <div className="footer-col">
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
          <p>📧 masarquemae65@gmail.com</p>
          <p>📱 09706383306</p>
          <p>📍 Masbate, Philippines</p>
        </div>
      </footer>

    </main>
  );
}

