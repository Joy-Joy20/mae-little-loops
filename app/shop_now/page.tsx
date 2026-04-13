"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ShopNow() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    <main className="min-h-screen bg-gray-200">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
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
          <span>🛒</span>
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

      {/* PRODUCTS */}
      <section className="flex justify-center gap-8 flex-wrap py-16">
        {products.map((item, index) => (
          <div key={index} className="bg-pink-200 rounded-2xl p-6 w-64 text-center shadow-md">
            <Image src={item.img} alt={item.name} width={120} height={120} className="mx-auto" />
            <h2 className="mt-4 font-semibold">{item.name}</h2>
            <p className="text-pink-600 font-bold mt-1">{item.price}</p>
            <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full" onClick={() => window.location.href='/bouquets'}>
              SHOP NOW
            </button>
          </div>
        ))}
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