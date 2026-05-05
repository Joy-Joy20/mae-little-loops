"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

import BuyNowModal from "../../components/BuyNowModal";
import ChatWidget from "../../components/ChatWidget";

type Product = { id: string; name: string; price: string; img: string | null; description?: string; stock: number; };

const FALLBACK_BOUQUETS: Product[] = [
  { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png", stock: 10, description: "A vibrant handmade crochet bouquet featuring colorful tulips in red, yellow, blue, and purple. Perfect as a gift or home decoration." },
  { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png", stock: 10, description: "A lovely pastel-colored crochet flower bouquet with soft pink and blue blossoms. Great for birthdays and special occasions." },
  { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png", stock: 10, description: "An elegant bouquet of handcrafted lavender bell-shaped flowers wrapped in premium tissue paper with a pink ribbon." },
  { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png", stock: 10, description: "A delicate mini bouquet of white pastel crochet flowers, perfect as a small gift or desk decoration." },
  { id: "5", name: "Crimson Charm", price: "₱200.00", img: "/Crimson Charm.png", stock: 10, description: "A bold and beautiful crimson crochet bouquet that makes a striking statement for any occasion." },
  { id: "6", name: "Lavender Luxe", price: "₱250.00", img: "/Lavender Luxe.png", stock: 10, description: "A luxurious lavender crochet bouquet with rich purple tones, perfect for anniversaries and special events." },
  { id: "7", name: "Skyline Serenade", price: "₱300.00", img: "/Skyline Serenade.png", stock: 10, description: "A dreamy blue-toned crochet bouquet inspired by the sky. A unique and calming gift for loved ones." },
  { id: "8", name: "Pastel Rainbow", price: "₱150.00", img: "/Pastel Rainbow.png", stock: 10, description: "A cheerful pastel rainbow crochet bouquet bursting with soft colors. Brings joy to any room or occasion." },
];

function BouquetCard({ item, onAddToCart, onBuyNow, onSelect }: {
  item: Product;
  onAddToCart: (p: Product, qty: number) => void;
  onBuyNow: (p: Product, qty: number) => void;
  onSelect: (p: Product) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="product-card" onClick={() => onSelect(item)} style={{cursor:'pointer'}}>
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

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<{ id?: string; name: string; price: string; img: string | null; quantity?: number } | null>(null);
  const [bouquets, setBouquets] = useState<Product[]>(FALLBACK_BOUQUETS);

  async function fetchBouquets() {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description")
      .eq("category", "bouquet")
      .order("id");
    if (data && data.length > 0) {
      setBouquets(data.map((p) => ({
        id: String(p.id),
        name: p.name,
        price: `₱${parseFloat(p.price).toFixed(2)}`,
        img: p.image_url?.trim() || (FALLBACK_BOUQUETS.find(f => f.name === p.name)?.img ?? null),
        stock: p.stock ?? 0,
        description: p.description ?? "",
      })));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    fetchBouquets();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", handleKey);

    const sub = supabase
      .channel("bouquets-stock")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products", filter: "category=eq.bouquet" }, (payload) => {
        setBouquets(prev => prev.map(p => p.id === String(payload.new.id) ? { ...p, stock: payload.new.stock } : p));
      })
      .subscribe();

    return () => { window.removeEventListener("keydown", handleKey); supabase.removeChannel(sub); };
  }, []);

  function handleAddToCart(product: Product | undefined, quantity: number) {
    if (!userEmail) { router.push("/login"); return; }
    if (!product) return;
    if (product.stock === 0) { alert("Sorry, this product is out of stock."); return; }
    if (quantity > product.stock) { alert(`Sorry, only ${product.stock} item(s) available in stock.`); return; }
    addToCart({ name: product.name, price: product.price, img: product.img, quantity });
    setSelectedProduct(null);
    alert(`${product.name} added to cart!`);
  }

  function handleBuyNow(product: Product | undefined, quantity: number) {
    if (!userEmail) { router.push("/login"); return; }
    if (!product) return;
    if (product.stock === 0) { alert("Sorry, this product is out of stock."); return; }
    setSelectedProduct(null);
    setBuyNowProduct({ id: product.id, name: product.name, price: product.price, img: product.img, quantity });
  }

  return (
    <main className="bouquets-page">

      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

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

      {/* NAVBAR - same as home */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Profile</a> : <a href="/login">Sign In</a>}
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
            <BouquetCard key={index} item={item} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onSelect={setSelectedProduct} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>masarquemae65@gmail.com</p><p>09706383306</p><p>Masbate, Philippines</p></div>
      </footer>


      <ChatWidget userEmail={userEmail} />

    </main>
  );
}
