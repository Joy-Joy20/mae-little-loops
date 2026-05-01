"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";
import QuantitySelector from "../../components/QuantitySelector";

type Product = { id: string; name: string; price: string; img: string | null; description?: string; };

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<(Product & { quantity?: number }) | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const bouquets: Product[] = [
    { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png", description: "A vibrant handmade crochet bouquet featuring colorful tulips in red, yellow, blue, and purple. Perfect as a gift or home decoration." },
    { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png", description: "A lovely pastel-colored crochet flower bouquet with soft pink and blue blossoms. Great for birthdays and special occasions." },
    { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png", description: "An elegant bouquet of handcrafted lavender bell-shaped flowers wrapped in premium tissue paper with a pink ribbon." },
    { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png", description: "A delicate mini bouquet of white pastel crochet flowers, perfect as a small gift or desk decoration." },
    { id: "5", name: "Crimson Charm", price: "₱200.00", img: "/Crimson Charm.png", description: "A bold and beautiful crimson crochet bouquet that makes a striking statement for any occasion." },
    { id: "6", name: "Lavender Luxe", price: "₱250.00", img: "/Lavender Luxe.png", description: "A luxurious lavender crochet bouquet with rich purple tones, perfect for anniversaries and special events." },
    { id: "7", name: "Skyline Serenade", price: "₱300.00", img: "/Skyline Serenade.png", description: "A dreamy blue-toned crochet bouquet inspired by the sky. A unique and calming gift for loved ones." },
    { id: "8", name: "Pastel Rainbow", price: "₱150.00", img: "/Pastel Rainbow.png", description: "A cheerful pastel rainbow crochet bouquet bursting with soft colors. Brings joy to any room or occasion." },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const getQuantity = (id: string) => quantities[id] ?? 1;
  const setQuantity = (id: string, value: number) => setQuantities((prev) => ({ ...prev, [id]: value }));

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedQuantity(getQuantity(product.id));
  }

  function handleAddToCart(name: string, price: string, img: string | null, quantity: number) {
    if (!userEmail) { router.push("/login"); return; }
    addToCart({ name, price, img, quantity });
    setSelectedProduct(null);
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string | null, quantity: number) {
    if (!userEmail) { router.push("/login"); return; }
    setSelectedProduct(null);
    setBuyNowProduct({ id: "", name, price, img, quantity });
  }

  return (
    <main className="bouquets-page">

      {buyNowProduct && <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setSelectedProduct(null)}>
          <div style={{background:'white',borderRadius:'24px',padding:'32px',maxWidth:'500px',width:'100%',position:'relative',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} style={{position:'absolute',top:'16px',right:'16px',background:'#fce4ec',border:'none',borderRadius:'50%',width:'32px',height:'32px',fontSize:'16px',color:'#e91e8c',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            <div style={{background:'linear-gradient(135deg,#fff0f5,#f3e5ff)',borderRadius:'16px',padding:'24px',display:'flex',justifyContent:'center',marginBottom:'20px'}}>
              {selectedProduct.img && <Image src={selectedProduct.img} alt={selectedProduct.name} width={200} height={200} style={{objectFit:'contain'}} />}
            </div>
            <span style={{background:'#f3e5ff',color:'#c44dff',fontSize:'12px',fontWeight:'700',padding:'4px 12px',borderRadius:'50px'}}>💐 Bouquet</span>
            <h2 style={{fontSize:'20px',fontWeight:'700',color:'#333',margin:'12px 0 6px'}}>{selectedProduct.name}</h2>
            <p style={{fontSize:'22px',fontWeight:'700',color:'#e91e8c',marginBottom:'12px'}}>{selectedProduct.price}</p>
            <p style={{fontSize:'14px',fontFamily:'inherit',fontWeight:'400',fontStyle:'normal',color:'#666',lineHeight:'1.7',marginBottom:'16px'}}>{selectedProduct.description}</p>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
              <QuantitySelector value={selectedQuantity} onChange={setSelectedQuantity} />
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={() => handleAddToCart(selectedProduct.name, selectedProduct.price, selectedProduct.img, selectedQuantity)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'2px solid #e91e8c',background:'white',color:'#e91e8c',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>Add to Cart</button>
              <button onClick={() => handleBuyNow(selectedProduct.name, selectedProduct.price, selectedProduct.img, selectedQuantity)} style={{flex:1,padding:'7px 16px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#ff6b9d,#c44dff)',color:'white',fontWeight:'700',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 3px 10px rgba(196,77,255,0.3)'}}>Buy Now</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR - same as home */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if(q) window.location.href = `/search?q=${encodeURIComponent(q)}`; }}} />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login'; }} className="logout-btn">Logout</button>
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
        <a href="/bouquets" className="category-item"><span>💐</span> Bouquets</a>
        <a href="/keychain" className="category-item"><span>🔑</span> Keychain</a>
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
            <div key={index} className="product-card" onClick={() => openProduct(item)} style={{cursor:'pointer'}}>
              <div className="product-img-wrapper">
                {item.img ? (
                  <Image src={item.img} alt={item.name} width={160} height={160} className="product-img" />
                ) : (
                  <div style={{fontSize:'60px', lineHeight:'1'}}>🌸</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price}</p>
                <div style={{display:'flex',justifyContent:'center',width:'100%'}} onClick={(e) => e.stopPropagation()}>
                  <QuantitySelector value={getQuantity(item.id)} onChange={(value) => setQuantity(item.id, value)} compact />
                </div>
                <div className="btn-row">
                  <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item.name, item.price, item.img ?? null, getQuantity(item.id)); }}>Add to Cart</button>
                  <button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyNow(item.name, item.price, item.img ?? null, getQuantity(item.id)); }}>Buy Now</button>
                </div>
              </div>
            </div>
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
