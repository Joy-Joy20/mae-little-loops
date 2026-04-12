"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  function handleAddToCart(name: string, price: string) {
    if (!userEmail) {
      window.location.href = "/login";
      return;
    }
    addToCart({ name, price });
    alert(`${name} added to cart!`);
  }

export default function Bouquets() {
  const bouquets = [
    { name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
    { name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
    { name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
    { name: "Mini White Pastel Flower", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
    { name: "Pink Star Lily Bloom", price: "₱200.00", img: null },
    { name: "Pastel Twin Tulips", price: "₱250.00", img: null },
    { name: "Pure White Rosebud", price: "₱300.00", img: null },
    { name: "Pink Tulip Delight", price: "₱150.00", img: null },
  ];

  return (
    <main className="min-h-screen bg-gray-200">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>

        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span>🛒 {cart.length > 0 && <sup style={{background:'#ff1493', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}</span>
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

      {/* BOUQUETS */}
      <section className="flex justify-center gap-8 flex-wrap py-16">
        {bouquets.map((item, index) => (
          <div key={index} className="bg-pink-200 rounded-2xl p-6 w-64 text-center shadow-md">
            {item.img ? (
              <Image src={item.img} alt={item.name} width={120} height={120} className="mx-auto" />
            ) : (
              <div className="mx-auto w-[120px] h-[120px] bg-pink-300 rounded-xl flex items-center justify-center text-4xl">🌸</div>
            )}
            <h2 className="mt-4 font-semibold">{item.name}</h2>
            <p className="text-pink-600 font-bold">{item.price}</p>
            <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full" onClick={() => handleAddToCart(item.name, item.price)}>
              ADD TO CART
            </button>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="bg-pink-300 py-10 px-10 flex justify-between flex-wrap">
        <div>
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          <h2 className="font-bold mt-2">Mae Little Loops Studio</h2>
        </div>
        <div>
          <h3 className="font-bold mb-2">🌸 Special Bouquets</h3>
          <ul className="list-disc ml-5">
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
