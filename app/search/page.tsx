"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import BuyNowModal from "../../components/BuyNowModal";

type Product = { id: string; name: string; price: number; image_url: string | null; category: string; };

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<{ name: string; price: string; img: string | null } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    if (!query) return;
    setLoading(true);
    supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .ilike("name", `%${query}%`)
      .then(({ data, error }) => {
        if (error) console.error("Search error:", error);
        if (data) setResults(data);
        setLoading(false);
      });
  }, [query]);

  function handleAddToCart(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    addToCart({ name, price, img });
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string | null) {
    if (!userEmail) { router.push("/login"); return; }
    setBuyNowProduct({ name, price, img });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="search-page">

      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Dashboard</a> : <a href="/login">Sign In</a>}
        </nav>
        <div className="nav-right">
          <input
            name="q" type="text" defaultValue={query} placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => { if (e.key === "Enter") { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`; }}}
          />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
        <a href="/bouquets" className="category-item"><span>💐</span> Bouquets</a>
        <a href="/keychain" className="category-item"><span>🔑</span> Keychain</a>
      </div>

      <section className="search-results-section">
        {!query ? (
          <p className="search-empty">Type something to search.</p>
        ) : loading ? (
          <p className="search-empty">Searching...</p>
        ) : results.length === 0 ? (
          <p className="search-empty">No products found for &quot;{query}&quot;.</p>
        ) : (
          <>
            <p className="search-count">{results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;</p>
            <div className="search-grid">
              {results.map((item) => {
                const price = `₱${parseFloat(String(item.price)).toFixed(2)}`;
                const img = item.image_url && item.image_url.trim() !== "" ? item.image_url : null;
                return (
                  <div key={item.id} className="product-card">
                    <div className="product-img-wrapper">
                      {img ? (
                        <Image src={img} alt={item.name} width={150} height={150} className="product-img" />
                      ) : (
                        <div style={{fontSize:'60px', lineHeight:'1'}}>{item.category === "bouquet" ? "🌸" : "🔑"}</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{item.name}</h3>
                      <p className="product-price">{price}</p>
                      <div className="btn-row">
                        <button className="add-btn" onClick={() => handleAddToCart(item.name, price, img)}>Add to Cart</button>
                        <button className="buy-btn" onClick={() => handleBuyNow(item.name, price, img)}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <footer>
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love 🌸</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 masarquemae65@gmail.com</p><p>📱 09706383306</p><p>📍 Masbate, Philippines</p></div>
      </footer>

    </main>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
