"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";

type Keychain = { id: string; name: string; price: string; img: string; description?: string; stock: number; };

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
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',margin:'8px 0'}}>
          <button onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} style={{width:'32px',height:'32px',borderRadius:'50%',border:'1.5px solid #e91e8c',background:'white',color:'#e91e8c',fontSize:'18px',cursor:'pointer',fontWeight:'bold'}}>−</button>
          <span style={{fontWeight:'600',fontSize:'16px',minWidth:'24px',textAlign:'center'}}>{quantity}</span>
          <button onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.min(item.stock, q + 1)); }} style={{width:'32px',height:'32px',borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',fontSize:'18px',cursor:'pointer',fontWeight:'bold'}}>+</button>
        </div>
        <div className="btn-row">
          <button className="add-btn" onClick={(e) => { e.stopPropagation(); onAddToCart(item, quantity); setQuantity(1); }}>Add to Cart</button>
          <button className="buy-btn" onClick={(e) => { e.stopPropagation(); onBuyNow(item, quantity); }}>Buy Now</button>
        </div>
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

  const keychains: Keychain[] = [
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleAddToCart(product: Keychain | undefined, quantity: number) {
    if (!userEmail) return router.push("/login");
    if (!product) return;
    addToCart({ name: product.name, price: product.price, img: product.img, quantity });
    setSelectedProduct(null);
    alert(`${product.name} added to cart!`);
  }

  function handleBuyNow(product: Keychain | undefined, quantity: number) {
    if (!userEmail) return router.push("/login");
    if (!product) return;
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
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={() => handleAddToCart(selectedProduct, 1)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'2px solid #e91e8c',background:'white',color:'#e91e8c',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>Add to Cart</button>
              <button onClick={() => handleBuyNow(selectedProduct, 1)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',color:'white',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 3px 10px rgba(196,77,255,0.3)'}}>Buy Now</button>
            </div>
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
          <p>📧 masarquemae65@gmail.com</p>
          <p>📱 09706383306</p>
          <p>📍 Masbate, Philippines</p>
        </div>
      </footer>

    </main>
  );
}
