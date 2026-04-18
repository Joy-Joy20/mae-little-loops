"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const allProducts = [
  { name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png", type: "bouquet" },
  { name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png", type: "bouquet" },
  { name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png", type: "bouquet" },
  { name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png", type: "bouquet" },
  { name: "Pink Star Lily Bloom", price: "₱200.00", img: null, type: "bouquet" },
  { name: "Pastel Twin Tulips", price: "₱250.00", img: null, type: "bouquet" },
  { name: "Pure White Rosebud", price: "₱300.00", img: null, type: "bouquet" },
  { name: "Pink Tulip Delight", price: "₱150.00", img: null, type: "bouquet" },
  { name: "Bunny Love Keychain", price: "₱80.00", img: null, type: "keychain" },
  { name: "Star Charm Keychain", price: "₱90.00", img: null, type: "keychain" },
  { name: "Mini Bear Keychain", price: "₱100.00", img: null, type: "keychain" },
  { name: "Heart Bloom Keychain", price: "₱85.00", img: null, type: "keychain" },
  { name: "Pastel Cloud Keychain", price: "₱95.00", img: null, type: "keychain" },
  { name: "Rainbow Drop Keychain", price: "₱110.00", img: null, type: "keychain" },
  { name: "Flower Petal Keychain", price: "₱75.00", img: null, type: "keychain" },
  { name: "Sweet Bow Keychain", price: "₱88.00", img: null, type: "keychain" },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const results = allProducts.filter((p) => p.name.toLowerCase().includes(query));

  return (
    <main className="search-page">

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
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
          <a href="/login" className="login-icon" title="Login">👤</a>
          <span onClick={() => window.location.href='/cart'} style={{cursor:'pointer'}}>🛒</span>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="category-bar">
        <a href="/bouquets" className="category-item">
          <span>💐</span>
          <p>Bouquets</p>
        </a>
        <a href="/keychain" className="category-item">
          <span>🔑</span>
          <p>Keychain</p>
        </a>
      </div>

      {/* RESULTS */}
      <section className="search-results-section">
        {query === "" ? (
          <p className="search-empty">Type something to search.</p>
        ) : results.length === 0 ? (
          <p className="search-empty">No products found for &quot;{query}&quot;.</p>
        ) : (
          <>
            <p className="search-count">{results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;</p>
            <div className="search-grid">
              {results.map((item, index) => (
                <div key={index} className="product-card">
                  <div className="product-img-wrapper">
                    {item.img ? (
                      <Image src={item.img} alt={item.name} width={160} height={160} className="product-img" />
                    ) : (
                      <div style={{fontSize:'60px', lineHeight:'1'}}>
                        {item.type === "bouquet" ? "🌸" : "🔑"}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{item.name}</h3>
                    <p className="product-price">{item.price}</p>
                    <button className="shop-btn" onClick={() => window.location.href = item.type === "bouquet" ? "/bouquets" : "/keychain"}>
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
