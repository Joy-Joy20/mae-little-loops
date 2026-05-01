"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type Product = { id: string; name: string; price: string; img: string | null; };

export default function ShopNow() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const router = useRouter();

  const fallback: Product[] = [
    { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
    { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
    { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
    { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
    { id: "5", name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png" },
    { id: "6", name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png" },
  ];

  const visibleCount = 3;
  const maxIndex = Math.max(0, products.length - visibleCount);
  const visibleProducts = products.slice(cardIndex, cardIndex + visibleCount);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
    supabase.from("products").select("id, name, price, image_url").limit(6).then(({ data, error }) => {
      if (error) console.error("Error fetching products:", error);
      if (data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: String(p.id),
          name: p.name,
          price: `₱${parseFloat(p.price).toFixed(2)}`,
          img: p.image_url && p.image_url.trim() !== "" ? p.image_url : null,
        }));
        // If all image_urls are empty, use fallback images by name
        const withImages = mapped.map((p) => ({
          ...p,
          img: p.img ?? (fallback.find(f => f.name === p.name)?.img ?? null),
        }));
        setProducts(withImages);
      } else {
        setProducts(fallback);
      }
      setProductsLoading(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/login");
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const sanitized = searchQuery.trim().replace(/[<>"']/g, "");
      if (sanitized) router.push(`/search?q=${encodeURIComponent(sanitized)}`);
    }
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'linear-gradient(135deg,#fff0f5,#f3e5ff)'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
        <div className="skeleton" style={{width:'80px',height:'80px',borderRadius:'50%'}} />
        <div className="skeleton" style={{width:'200px',height:'20px'}} />
        <div className="skeleton" style={{width:'140px',height:'16px'}} />
      </div>
    </div>
  );

  /* ===== GUEST LANDING PAGE ===== */
  if (!userEmail) {
    return (
      <main className="guest-page">
        <div className="guest-hero">
          <Image src="/logo.png" alt="Mae Little Loops Studio" width={200} height={200} style={{borderRadius:'20px'}} priority />
          <h1 className="guest-title">Mae Little Loops Studio</h1>
          <p className="guest-desc">Handmade with love 🌸 — Beautiful crochet bouquets and adorable keychains, crafted with care for every occasion.</p>
          <div className="guest-btns">
            <a href="/login" className="guest-btn-primary">Login</a>
            <a href="/signup" className="guest-btn-secondary">Sign Up</a>
          </div>
          <a href="/shop_now?browse=true" className="guest-browse" onClick={(e) => { e.preventDefault(); setUserEmail("guest"); }}>
            Browse as Guest →
          </a>
        </div>

        <div className="guest-features">
          <div className="guest-feature">
            <span>💐</span>
            <h3>Handmade Bouquets</h3>
            <p>Beautiful crochet bouquets for every occasion</p>
          </div>
          <div className="guest-feature">
            <span>🔑</span>
            <h3>Cute Keychains</h3>
            <p>Adorable handmade keychains as gifts or accessories</p>
          </div>
          <div className="guest-feature">
            <span>🌸</span>
            <h3>Made with Love</h3>
            <p>Every piece crafted with care and attention to detail</p>
          </div>
        </div>
      </main>
    );
  }

  /* ===== LOGGED-IN HOME PAGE ===== */
  return (
    <main className="shop-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input type="text" placeholder="Search..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail?.split('@')[0]}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer', color:'white'}}>
            🛒 {cart.length > 0 && <sup style={{background:'white', color:'#c44dff', borderRadius:'50%', padding:'1px 5px', fontSize:'10px', fontWeight:'bold'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item"><span>💐</span><p>Bouquets</p></a>
        <a href="/keychain" className="category-item"><span>🔑</span><p>Keychain</p></a>
      </div>

      <div className="home-desc-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>
        <p className="products-desc">Discover our handmade crochet bouquets and keychains — crafted with love and perfect for every occasion. 🌸</p>

        {productsLoading ? (
          <div className="carousel-wrapper">
            <div style={{width:'48px', minWidth:'48px'}} />
            <div className="carousel-cards">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton-card" style={{flex:1, minWidth:0, maxWidth:'280px'}}>
                  <div className="skeleton skeleton-circle" />
                  <div className="skeleton skeleton-line" style={{width:'80%', margin:'0 auto 10px'}} />
                  <div className="skeleton skeleton-line" style={{width:'50%', margin:'0 auto 10px'}} />
                  <div className="skeleton skeleton-btn" />
                </div>
              ))}
            </div>
            <div style={{width:'48px', minWidth:'48px'}} />
          </div>
        ) : (
          <div className="carousel-wrapper">
            <button className="carousel-arrow" onClick={() => setCardIndex((i) => Math.max(i - 1, 0))} disabled={cardIndex === 0}>&#8249;</button>
            <div className="carousel-cards">
              {visibleProducts.map((item) => (
                <div key={item.id} className="product-card">
                  <div className="product-img-wrapper">
                    <img
                      src={item.img ?? "/Rainbow Tulip Charm.png"}
                      alt={item.name}
                      width={160}
                      height={160}
                      className="product-img"
                      style={{objectFit:'contain', objectPosition:'center', display:'block', margin:'0 auto'}}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/Rainbow Tulip Charm.png"; }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{item.name}</h3>
                    <p className="product-price">{item.price}</p>
                    <button className="shop-btn" onClick={() => router.push('/bouquets')}>Shop Now</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow" onClick={() => setCardIndex((i) => Math.min(i + 1, maxIndex))} disabled={cardIndex >= maxIndex}>&#8250;</button>
          </div>
        )}
      </section>

      <footer>
        <div className="footer-col">
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p><p>📍 Cebu City, Philippines</p></div>
      </footer>

    </main>
  );
}
