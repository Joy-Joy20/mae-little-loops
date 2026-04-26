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
  const [productsLoading, setProductsLoading] = useState(true);
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const router = useRouter();

  const visibleCount = 3;
  const maxIndex = Math.max(0, products.length - visibleCount);
  const visibleProducts = products.slice(cardIndex, cardIndex + visibleCount);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (products.length <= visibleCount) return;
    const timer = setInterval(() => {
      setCardIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [products.length, maxIndex, visibleCount]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
    supabase.from("products").select("id, name, price, img").limit(6).then(({ data, error }) => {
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback hardcoded products
        setProducts([
          { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
          { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
          { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
          { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
          { id: "5", name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png" },
          { id: "6", name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png" },
        ]);
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

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#f06292',fontSize:'18px'}}>Loading...</div>;

  /* ===== GUEST LANDING PAGE ===== */
  if (!userEmail) {
    return (
      <main className="guest-page">
        <div className="guest-hero">
          <Image src="/logo.png" alt="Mae Sister's Bouquet" width={200} height={200} style={{borderRadius:'20px'}} priority />
          <h1 className="guest-title">Mae Sister's Bouquet</h1>
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
        <h1>Mae Sister's Bouquet</h1>
        <nav>
          <a href="/shop_now" className="active-link">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input type="text" placeholder="Search..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{fontSize:'13px', fontWeight:'bold', cursor:'pointer'}} onClick={() => router.push('/dashboard')}>👤 {userEmail}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>
            🛒 {cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}
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

      <section style={{padding:'40px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
        <h2 style={{fontSize:'2rem', fontWeight:'700', background:'linear-gradient(135deg, #ff6b9d, #c44dff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'12px', textAlign:'center', width:'100%'}}>Featured Products</h2>
        <p style={{fontSize:'1rem', color:'#888', textAlign:'center', marginBottom:'1.5rem', width:'100%'}}>Discover our handmade crochet bouquets and keychains — crafted with love and perfect for every occasion. 🌸</p>

        {productsLoading ? (
          <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'40px', color:'#c44dff'}}>
            <span style={{fontSize:'16px'}}>Loading products...</span>
          </div>
        ) : (
          <div style={{width:'100%', display:'flex', flexDirection:'row', alignItems:'center', gap:'16px', padding:'32px 0'}}>

            {/* LEFT ARROW */}
            <button onClick={() => setCardIndex((i) => Math.max(i - 1, 0))} disabled={cardIndex === 0}
              style={{width:'48px', height:'48px', minWidth:'48px', borderRadius:'50%', border:'none', background: cardIndex === 0 ? 'rgba(196,77,255,0.2)' : 'linear-gradient(135deg, #ff6b9d, #c44dff)', color:'white', fontSize:'28px', cursor: cardIndex === 0 ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: cardIndex === 0 ? 'none' : '0 4px 16px rgba(196,77,255,0.4)', transition:'all 0.3s'}}>
              &#8249;
            </button>

            {/* CARDS */}
            <div style={{display:'flex', flexDirection:'row', gap:'20px', flex:1, justifyContent:'center', overflow:'hidden'}}>
              {visibleProducts.map((item) => (
                <div key={item.id} style={{background:'white', borderRadius:'20px', overflow:'hidden', border:'1px solid #f3e5ff', boxShadow:'0 4px 16px rgba(196,77,255,0.1)', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', flex:1, minWidth:0, maxWidth:'280px', transition:'all 0.3s ease'}}>
                  <div style={{background:'linear-gradient(135deg, #fff0f5, #f3e5ff)', width:'100%', height:'180px', display:'flex', justifyContent:'center', alignItems:'center', padding:'16px'}}>
                    {item.img ? (
                      <Image src={item.img} alt={item.name} width={140} height={140} style={{objectFit:'contain', width:'140px', height:'140px', transition:'transform 0.3s'}} />
                    ) : (
                      <div style={{fontSize:'60px', lineHeight:'1'}}>🌸</div>
                    )}
                  </div>
                  <div style={{padding:'14px 16px 20px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', background:'white'}}>
                    <h3 style={{fontSize:'14px', fontWeight:'600', color:'#333', lineHeight:'1.4', minHeight:'40px', display:'flex', alignItems:'center', justifyContent:'center'}}>{item.name}</h3>
                    <p style={{fontSize:'15px', fontWeight:'700', color:'#c44dff'}}>
                      {item.price && item.price.toString().startsWith('₱') ? item.price : `₱${parseFloat(item.price || '0').toFixed(2)}`}
                    </p>
                    <button onClick={() => router.push('/bouquets')} style={{padding:'9px 22px', border:'none', borderRadius:'50px', background:'linear-gradient(135deg, #ff6b9d, #c44dff)', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px rgba(196,77,255,0.3)', transition:'all 0.3s', fontFamily:'inherit'}}>Shop Now</button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT ARROW */}
            <button onClick={() => setCardIndex((i) => Math.min(i + 1, maxIndex))} disabled={cardIndex >= maxIndex}
              style={{width:'48px', height:'48px', minWidth:'48px', borderRadius:'50%', border:'none', background: cardIndex >= maxIndex ? 'rgba(196,77,255,0.2)' : 'linear-gradient(135deg, #ff6b9d, #c44dff)', color:'white', fontSize:'28px', cursor: cardIndex >= maxIndex ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: cardIndex >= maxIndex ? 'none' : '0 4px 16px rgba(196,77,255,0.4)', transition:'all 0.3s'}}>
              &#8250;
            </button>

          </div>
        )}

        {/* DOTS */}
        {!productsLoading && products.length > visibleCount && (
          <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
            {Array.from({length: maxIndex + 1}).map((_, i) => (
              <button key={i} onClick={() => setCardIndex(i)} style={{width: i === cardIndex ? '20px' : '8px', height:'8px', borderRadius:'4px', border:'none', background: i === cardIndex ? '#c44dff' : 'rgba(196,77,255,0.3)', cursor:'pointer', transition:'all 0.3s', padding:0}} />
            ))}
          </div>
        )}
      </section>

      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={150} height={150} style={{borderRadius:'12px', objectFit:'contain'}} />
          <h3>Mae Sister's Bouquet</h3>
          <p>Handmade with love 🌸</p>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p><p>📍 Cebu City, Philippines</p></div>
      </footer>

    </main>
  );
}
