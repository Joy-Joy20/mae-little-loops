"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function Keychain() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  function handleAddToCart(name: string, price: string) {
    if (!userEmail) return router.push("/login");
    addToCart({ name, price });
  }

  function handleBuyNow(name: string, price: string) {
    if (!userEmail) return router.push("/login");
    addToCart({ name, price });
    router.push("/cart");
  }

  const keychains = [
    { name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png" },
    { name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png" },
    { name: "Strawberry-Hat Creature", price: "₱100.00", img: "/Strawberry-Hat Creature.png" },
    { name: "Purple Bow", price: "₱95.00", img: "/Purple Bow.png" },
    { name: "Monkey D. Luffy", price: "₱110.00", img: "/Monkey D. Luffy.png" },
    { name: "Teddy Bear", price: "₱75.00", img: "/Teddy Bear.png" },
    { name: "Sweet Bow Keychain", price: "₱88.00", img: "/Sweet Bow Keychain.png" },
    { name: "Kuromi (Head Only)", price: "₱88.00", img: "/Kuromi (Head Only).png" },
    { name: "Kuromi (Full Body)", price: "₱88.00", img: "/Kuromi (Full Body).png" },
    { name: "Brown Teddy Bear", price: "₱75.00", img: "/Brown Teddy Bear.png" },
  ];

  return (
    <main className="page">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>

        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
              }
            }}
          />
          {userEmail ? (
            <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer'}}>
            🛒{cart.length > 0 && <sup style={{background:'#ff1493', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      {/* CATEGORY ICONS */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">
          <span>💐</span>
          <p>Bouquets</p>
        </a>
        <a href="/keychain" className="category-item active-link">
          <span>🔑</span>
          <p>Keychain</p>
        </a>
      </div>

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      {/* PRODUCTS */}
      <section className="products-container">
        {keychains.map((item, index) => (
          <div key={index} className="product-card">

            <Image
                src={item.img}
                alt={item.name}
                width={120}
                height={120}
                className="product-img"
              />

            <h2>{item.name}</h2>
            <p>{item.price}</p>

            <button onClick={() => handleAddToCart(item.name, item.price)}>
                ADD TO CART
              </button>

              <button onClick={() => handleBuyNow(item.name, item.price)}>
                BUY NOW
              </button>

          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <h2>Mae Little Loops Studio</h2>
        <p>📧 maelittleloops@gmail.com</p>
      </footer>

    </main>
  );
}