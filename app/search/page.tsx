"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Product = { id: string; name: string; price: string; img: string | null; category: string; };

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    supabase
      .from("products")
      .select("id, name, price, img, category")
      .ilike("name", `%${query}%`)
      .then(({ data }) => {
        if (data) setResults(data);
        setLoading(false);
      });
  }, [query]);

  return (
    <main className="search-page">

      <header>
        <h1>Mae Sister's Bouquet</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a><a href="/dashboard">Dashboard</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`; }}
          />
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>🛒</span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item"><span>💐</span><p>Bouquets</p></a>
        <a href="/keychain" className="category-item"><span>🔑</span><p>Keychain</p></a>
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
              {results.map((item) => (
                <div key={item.id} className="product-card">
                  <div className="product-img-wrapper">
                    {item.img ? (
                      <Image src={item.img} alt={item.name} width={160} height={160} className="product-img" />
                    ) : (
                      <div style={{fontSize:'60px', lineHeight:'1'}}>
                        {item.category === "bouquet" ? "🌸" : "🔑"}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{item.name}</h3>
                    <p className="product-price">{item.price}</p>
                    <button className="shop-btn" onClick={() => router.push(item.category === "bouquet" ? "/bouquets" : "/keychain")}>
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <footer>
        <div className="footer-col"><h3>Mae Sister's Bouquet</h3><p>Handmade with love 🌸</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>📧 maelittleloops@gmail.com</p><p>📱 09XXXXXXXXX</p></div>
      </footer>

    </main>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
