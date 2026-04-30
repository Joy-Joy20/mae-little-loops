"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";

export default function Keychain() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [buyNowProduct, setBuyNowProduct] = useState<{name:string; price:string; img:string|null}|null>(null);
  const [page, setPage] = useState(0);
  const perPage = 4;

  const keychains = [
    { id: "9", name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png" },
    { id: "10", name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png" },
    { id: "11", name: "Strawberry-Hat Creature", price: "₱100.00", img: "/Strawberry-Hat Creature.png" },
    { id: "12", name: "Purple Bow", price: "₱95.00", img: "/Purple Bow.png" },
    { id: "13", name: "Monkey D. Luffy", price: "₱110.00", img: "/Monkey D. Luffy.png" },
    { id: "14", name: "Teddy Bear", price: "₱75.00", img: "/Teddy Bear.png" },
    { id: "15", name: "Strawberry", price: "₱88.00", img: "/Strawberry.png" },
    { id: "16", name: "Kuromi (Head Only)", price: "₱88.00", img: "/Kuromi (Head Only).png" },
    { id: "17", name: "Kuromi (Full Body)", price: "₱88.00", img: "/Kuromi (Full Body).png" },
    { id: "18", name: "Brown Teddy Bear", price: "₱75.00", img: "/Brown Teddy Bear.png" },
  ];

  const totalPages = Math.ceil(keychains.length / perPage);
  const paginated = keychains.slice(page * perPage, page * perPage + perPage);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  function handleAddToCart(name: string, price: string, img: string) {
    if (!userEmail) return router.push("/login");
    addToCart({ name, price, img });
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string) {
    if (!userEmail) return router.push("/login");
    setBuyNowProduct({ name, price, img });
  }

  return (
    <main className="keychain-page">
      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if(q) router.push(`/search?q=${encodeURIComponent(q)}`); }}} />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="logout-btn">Logout</button>
            </>
          ) : (
            <a href="/login" className="login-icon" title="Login">👤</a>
          )}
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer', color:'white'}}>
            🛒 {cart.length > 0 && <sup style={{background:'white', color:'#c44dff', borderRadius:'50%', padding:'1px 5px', fontSize:'10px', fontWeight:'bold'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">
          <span>💐</span>
          <p>Bouquets</p>
        </a>
        <a href="/keychain" className="category-item active-cat">
          <span>🔑</span>
          <p>Keychain</p>
        </a>
      </div>

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>Handmade with love 🔑 — Cute and adorable keychains perfect as gifts or daily accessories.</p>
      </div>

      {/* KEYCHAINS GRID */}
      <section className="products-section">
        <h2 className="section-title">Our Keychains</h2>
        <div className="products-grid">
          {paginated.map((item, index) => (
            <div key={index} className="product-card" onClick={() => router.push(`/product/${item.id}`)} style={{cursor:'pointer'}}>
              <div className="product-img-wrapper">
                <Image src={item.img} alt={item.name} width={140} height={140} className="product-img" />
              </div>
              <h3 className="product-name">{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <div className="btn-row">
                <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item.name, item.price, item.img); }}>Add to Cart</button>
                <button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyNow(item.name, item.price, item.img); }}>Buy Now</button>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>← Prev</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`page-btn ${page === i ? "active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>Next →</button>
          </div>
        )}
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
          <p>📧 maelittleloops@gmail.com</p>
          <p>📱 09XXXXXXXXX</p>
          <p>📍 Cebu City, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
