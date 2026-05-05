"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import ChatWidget from "../../components/ChatWidget";

type Product = { id: string; name: string; price: string; img: string | null; };

export default function ShopNow() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
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

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("users").select("username, phone").eq("id", user.id).single();
      if (!profile?.username?.trim()) setShowProfilePrompt(true);
    };
    checkProfile();
  }, []);

  useEffect(() => {
    if (showProfilePrompt) {
      const timer = setTimeout(() => setShowProfilePrompt(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showProfilePrompt]);

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

  /* ===== SHOP PAGE — same for all users ===== */
  return (
    <main className="shop-page">

      {/* PROFILE PROMPT TOAST */}
      {showProfilePrompt && (
        <div style={{position:'fixed',top:'80px',left:'50%',transform:'translateX(-50%)',zIndex:999,background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',padding:'14px 24px',borderRadius:'50px',boxShadow:'0 6px 20px rgba(233,30,140,0.3)',display:'flex',alignItems:'center',gap:'12px',fontSize:'14px',fontWeight:'600',maxWidth:'90vw'}}>
          <span>👋 Welcome! Please complete your profile first.</span>
          <a href="/dashboard" style={{background:'white',color:'#e91e8c',padding:'6px 16px',borderRadius:'50px',textDecoration:'none',fontWeight:'700',fontSize:'13px',whiteSpace:'nowrap'}}>Edit Profile</a>
          <button onClick={() => setShowProfilePrompt(false)} style={{background:'rgba(255,255,255,0.3)',border:'none',borderRadius:'50%',width:'24px',height:'24px',color:'white',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>✕</button>
        </div>
      )}

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Profile</a> : <a href="/login">Sign In</a>}
        </nav>
        <div className="nav-right">
          <input type="text" placeholder="Search..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <a href="/login" className="login-icon">👤</a>
          )}
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
                    <button
                      onClick={() => userEmail ? router.push('/bouquets') : router.push('/login')}
                      style={{width:'100%',padding:'12px',borderRadius:'50px',border:'none',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',fontWeight:'700',fontSize:'14px',cursor:'pointer',transition:'all 0.3s ease',marginTop:'8px'}}
                    >
                      Shop Now
                    </button>
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
        <div className="footer-col"><h3>Contact</h3><p>📧 masarquemae65@gmail.com</p><p>📱 09706383306</p><p>📍 Masbate, Philippines</p></div>
      </footer>

      <ChatWidget userEmail={userEmail} />

    </main>
  );
}
