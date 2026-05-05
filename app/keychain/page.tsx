"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";

type Keychain = { id: string; name: string; price: string; img: string; description?: string; stock: number; };

const FALLBACK_KEYCHAINS: Keychain[] = [
  { id: "9", name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png", stock: 10, description: "An adorable handmade crochet penguin keychain wearing a graduation cap. Perfect graduation gift for friends and classmates." },
  { id: "10", name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png", stock: 10, description: "A cute crochet frog keychain wearing a tiny hat. A fun and quirky accessory for bags and keys." },
  { id: "11", name: "Strawberry-Hat Creature", price: "₱100.00", img: "/Strawberry-Hat Creature.png", stock: 10, description: "A charming little crochet creature wearing a strawberry hat. Unique and handmade with love." },
  { id: "12", name: "Purple Bow", price: "₱95.00", img: "/Purple Bow.png", stock: 10, description: "A pretty purple crochet bow keychain. Simple, elegant, and perfect as an everyday accessory." },
  { id: "13", name: "Monkey D. Luffy", price: "₱110.00", img: "/Monkey D. Luffy.png", stock: 10, description: "A handmade crochet Monkey D. Luffy keychain inspired by One Piece. A must-have for anime fans!" },
  { id: "14", name: "Teddy Bear", price: "₱75.00", img: "/Teddy Bear.png", stock: 10, description: "A classic and cuddly crochet teddy bear keychain. Sweet and simple — perfect for all ages." },
  { id: "15", name: "Strawberry", price: "₱88.00", img: "/Strawberry.png", stock: 10, description: "A cute crochet strawberry keychain with vibrant red color and green leaves. Fresh and adorable!" },
  { id: "16", name: "Kuromi (Head Only)", price: "₱88.00", img: "/Kuromi (Head Only).png", stock: 10, description: "A handmade crochet Kuromi head keychain. Perfect for Sanrio fans who love the edgy little bunny." },
  { id: "17", name: "Kuromi (Full Body)", price: "₱88.00", img: "/Kuromi (Full Body).png", stock: 10, description: "A full-body crochet Kuromi keychain with detailed craftsmanship. A collector's item for Sanrio lovers." },
  { id: "18", name: "Brown Teddy Bear", price: "₱75.00", img: "/Brown Teddy Bear.png", stock: 10, description: "A warm brown crochet teddy bear keychain. Soft, cute, and handmade with care." },
];

function KeychainCard({ item, onAddToCart, onBuyNow, onSelect }: {
  item: Keychain;
  onAddToCart: (p: Keychain, qty: number) => void;
  onBuyNow: (p: Keychain, qty: number) => void;
  onSelect: (p: Keychain) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="product-card" onClick={() => onSelect(item)} style={{cursor:'pointer'}}>
      <div className="product-img-wrapper">
        <Image src={item.img} alt={item.name} width={140} height={140} className="product-img" />
      </div>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-price">{item.price}</p>
        {item.stock === 0 ? (
          <div style={{background:'#ffebee',color:'#c62828',padding:'10px 16px',borderRadius:'50px',textAlign:'center',fontWeight:'700',fontSize:'14px',marginTop:'12px',border:'1.5px solid #ef9a9a'}}>❌ Out of Stock</div>
        ) : (
          <>
            {item.stock <= 5 && <p style={{color:'#f57f17',fontSize:'12px',textAlign:'center',margin:'4px 0',fontWeight:'600'}}>⚠️ Only {item.stock} left in stock!</p>}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',margin:'8px 0'}}>
              <button onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} style={{width:'32px',height:'32px',borderRadius:'50%',border:'1.5px solid #e91e8c',background:'white',color:'#e91e8c',fontSize:'18px',cursor:'pointer',fontWeight:'bold'}}>−</button>
              <span style={{fontWeight:'600',fontSize:'16px',minWidth:'24px',textAlign:'center'}}>{quantity}</span>
              <button onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.min(item.stock, q + 1)); }} style={{width:'32px',height:'32px',borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',fontSize:'18px',cursor:'pointer',fontWeight:'bold'}}>+</button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center',marginTop:'12px'}}>
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(item, quantity); setQuantity(1); }} title="Add to Cart" style={{background:'linear-gradient(135deg,#e91e8c,#f06292)',border:'none',borderRadius:'50%',width:'42px',height:'42px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'18px',boxShadow:'0 4px 12px rgba(233,30,140,0.3)',transition:'all 0.3s ease',flexShrink:0}} onMouseEnter={(e) => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform='scale(1)'}>🛒</button>
              <button onClick={(e) => { e.stopPropagation(); onBuyNow(item, quantity); }} style={{flex:1,padding:'10px 16px',borderRadius:'50px',border:'none',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',fontWeight:'700',fontSize:'14px',cursor:'pointer',transition:'all 0.3s ease'}}>Buy Now</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Keychain() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Keychain | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<{ id?: string; name: string; price: string; img: string | null; quantity?: number } | null>(null);
  const [keychains, setKeychains] = useState<Keychain[]>(FALLBACK_KEYCHAINS);

  async function fetchKeychains() {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description")
      .eq("category", "keychain")
      .order("id");
    if (data && data.length > 0) {
      setKeychains(data.map((p) => ({
        id: String(p.id),
        name: p.name,
        price: `₱${parseFloat(p.price).toFixed(2)}`,
        img: p.image_url?.trim() || (FALLBACK_KEYCHAINS.find(f => f.name === p.name)?.img ?? "/Graduation Penguin.png"),
        stock: p.stock ?? 0,
        description: p.description ?? "",
      })));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    fetchKeychains();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", handleKey);

    const sub = supabase
      .channel("keychains-stock")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products", filter: "category=eq.keychain" }, (payload) => {
        setKeychains(prev => prev.map(p => p.id === String(payload.new.id) ? { ...p, stock: payload.new.stock } : p));
      })
      .subscribe();

    return () => { window.removeEventListener("keydown", handleKey); supabase.removeChannel(sub); };
  }, []);

  function handleAddToCart(product: Keychain | undefined, quantity: number) {
    if (!userEmail) return router.push("/login");
    if (!product) return;
    if (product.stock === 0) { alert("Sorry, this product is out of stock."); return; }
    if (quantity > product.stock) { alert(`Sorry, only ${product.stock} item(s) available in stock.`); return; }
    addToCart({ name: product.name, price: product.price, img: product.img, quantity });
    setSelectedProduct(null);
    alert(`${product.name} added to cart!`);
  }

  function handleBuyNow(product: Keychain | undefined, quantity: number) {
    if (!userEmail) return router.push("/login");
    if (!product) return;
    if (product.stock === 0) { alert("Sorry, this product is out of stock."); return; }
    setSelectedProduct(null);
    setBuyNowProduct({ id: product.id, name: product.name, price: product.price, img: product.img, quantity });
  }

  return (
    <main className="keychain-page">

      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setSelectedProduct(null)}>
          <div style={{background:'white',borderRadius:'24px',padding:'32px',maxWidth:'500px',width:'100%',position:'relative',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} style={{position:'absolute',top:'16px',right:'16px',background:'#fce4ec',border:'none',borderRadius:'50%',width:'32px',height:'32px',fontSize:'16px',color:'#e91e8c',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            <div style={{background:'linear-gradient(135deg,#fff0f5,#f3e5ff)',borderRadius:'16px',padding:'24px',display:'flex',justifyContent:'center',marginBottom:'20px'}}>
              <Image src={selectedProduct.img} alt={selectedProduct.name} width={200} height={200} style={{objectFit:'contain'}} />
            </div>
            <span style={{background:'#f3e5ff',color:'#c44dff',fontSize:'12px',fontWeight:'700',padding:'4px 12px',borderRadius:'50px'}}>🔑 Keychain</span>
            <h2 style={{fontSize:'20px',fontWeight:'700',color:'#333',margin:'12px 0 6px'}}>{selectedProduct.name}</h2>
            <p style={{fontSize:'22px',fontWeight:'700',color:'#e91e8c',marginBottom:'12px'}}>{selectedProduct.price}</p>
            <p style={{fontSize:'14px',fontFamily:'inherit',fontWeight:'400',fontStyle:'normal',color:'#666',lineHeight:'1.7',marginBottom:'20px'}}>{selectedProduct.description}</p>
            {selectedProduct.stock === 0 ? (
              <div style={{background:'#ffebee',color:'#c62828',padding:'10px 16px',borderRadius:'50px',textAlign:'center',fontWeight:'700',fontSize:'14px',border:'1.5px solid #ef9a9a'}}>❌ Out of Stock</div>
            ) : (
              <>
                {selectedProduct.stock <= 5 && <p style={{color:'#f57f17',fontSize:'12px',textAlign:'center',margin:'0 0 8px',fontWeight:'600'}}>⚠️ Only {selectedProduct.stock} left in stock!</p>}
                <div style={{display:'flex',gap:'12px'}}>
                  <button onClick={() => handleAddToCart(selectedProduct, 1)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'2px solid #e91e8c',background:'white',color:'#e91e8c',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>Add to Cart</button>
                  <button onClick={() => handleBuyNow(selectedProduct, 1)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',color:'white',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 3px 10px rgba(196,77,255,0.3)'}}>Buy Now</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Profile</a> : <a href="/login">Sign In</a>}
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
          {keychains.map((item, index) => (
            <KeychainCard key={index} item={item} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onSelect={setSelectedProduct} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p>
          <p style={{margin:"12px 0 6px",fontWeight:"600",fontSize:"13px",opacity:0.9}}>Follow Us</p>
          <div style={{display:"flex",gap:"12px"}}>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer" title="Facebook" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@mae.littleloops" target="_blank" rel="noopener noreferrer" title="TikTok" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
            <a href="mailto:masarquemae65@gmail.com" title="Email" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            masarquemae65@gmail.com
          </p>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            09706383306
          </p>
          <p style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Masbate, Philippines
          </p>
        </div>
        <div className="footer-bottom" style={{gridColumn:'1/-1',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'16px',fontSize:'13px',opacity:0.8}}>
          &copy; {new Date().getFullYear()} Mae Little Loops Studio. All Rights Reserved.
        </div>
      </footer>






    </main>
  );
}
