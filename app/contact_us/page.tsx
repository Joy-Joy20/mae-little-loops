"use client";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="contact-page">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>
        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us" className="active-link">Contact Us</a>
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

      {/* CONTACT FORM */}
      <section className="contact-content">
        <div className="contact-card">
          <h2>Get in Touch 🌸</h2>
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}}>
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            Facebook: <a href="https://www.facebook.com/mae.09706383306" target="_blank">Mae Orayan Masarque</a>
          </p>
        </div>

        <div className="contact-card">
          <h2>Contact Us 📬</h2>
          <p className="contact-sub">May tanong o mensahe? Mag-message lang!</p>

          {sent ? (
            <div className="success-msg">✅ Message sent! We will get back to you soon.</div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <input type="text" placeholder="Subject" required />
              <textarea placeholder="Your Message" rows={5} required />
              <button type="submit">SEND MESSAGE</button>
            </form>
          )}
        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-pink-300 py-10 px-10 flex justify-around items-start flex-wrap gap-8">
        <div>
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
