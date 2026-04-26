"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [buyNowProduct, setBuyNowProduct] = useState<{name:string; price:string; img:string|null}|null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  function handleAddToCart(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    addToCart({ name, price, img });
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    setBuyNowProduct({ name, price, img });
  }

  const bouquets = [
    { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
    { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
    { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
    { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
    { id: "5", name: "Crimson Charm", price: "₱200.00", img: "/Crimson Charm.png" },
    { id: "6", name: "Lavender Luxe", price: "₱250.00", img: "/Lavender Luxe.png" },
    { id: "7", name: "Skyline Serenade", price: "₱300.00", img: "/Skyline Serenade.png" },
    { id: "8", name: "Pastel Rainbow", price: "₱150.00", img: "/Pastel Rainbow.png" },
  ];

  return (
    <main className="bouquets-page">
      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
          {userEmail ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'13px', fontWeight:'bold'}}>👤 {userEmail}</span>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login'; }} className="logout-btn">Logout</button>
            </div>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>🛒 {cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}</span>
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
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets perfect for any occasion.</p>
      </div>

      {/* BOUQUETS GRID */}
      <section className="products-section">
        <h2 className="section-title">Our Bouquets</h2>
        <div className="products-grid">
          {bouquets.map((item, index) => (
            <div key={index} className="product-card">
              <div className="product-img-wrapper">
                {item.img ? (
                  <Image src={item.img} alt={item.name} width={160} height={160} className="product-img" />
                ) : (
                  <div style={{fontSize:'60px', lineHeight:'1'}}>🌸</div>
                )}
              </div>
              <h3 className="product-name">{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <div className="btn-row">
                <button className="add-btn" onClick={() => handleAddToCart(item.name, item.price, item.img ?? null)}>Add to Cart</button>
                <button className="buy-btn" onClick={() => handleBuyNow(item.name, item.price, item.img ?? null)}>Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={70} height={70} style={{borderRadius:'12px'}} />
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
          <p>📧 maelittleloops@gmail.com</p>
          <p>📱 09XXXXXXXXX</p>
          <p>📍 Cebu City, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
