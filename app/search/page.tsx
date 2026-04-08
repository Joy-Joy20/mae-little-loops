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

  const results = allProducts.filter((p) =>
    p.name.toLowerCase().includes(query)
  );

  return (
    <main className="search-page">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>
        <nav className="flex gap-6 font-medium">
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
            onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }}
          />
          <a href="/login" className="login-icon" title="Login">👤</a>
          <span>🛒</span>
        </div>
      </header>

      {/* CATEGORY ICONS */}
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
      <section className="flex justify-center gap-8 flex-wrap py-16">
        {query === "" ? (
          <p className="text-gray-500 text-lg">Type something to search.</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 text-lg">No products found for &quot;{query}&quot;.</p>
        ) : (
          results.map((item, index) => (
            <div key={index} className="bg-pink-200 rounded-2xl p-6 w-64 text-center shadow-md">
              {item.img ? (
                <Image src={item.img} alt={item.name} width={120} height={120} className="mx-auto" />
              ) : (
                <div className="mx-auto w-[120px] h-[120px] bg-pink-300 rounded-xl flex items-center justify-center text-4xl">
                  {item.type === "bouquet" ? "🌸" : "🔑"}
                </div>
              )}
              <h2 className="mt-4 font-semibold">{item.name}</h2>
              <p className="text-pink-600 font-bold mt-1">{item.price}</p>
              <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full">
                ADD TO CART
              </button>
            </div>
          ))
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-pink-300 py-10 px-10 flex justify-around items-start flex-wrap gap-8">
        <div>
          <h2 className="font-bold mt-2">Mae Little Loops Studio</h2>
        </div>
        <div className="text-center">
          <h3 className="font-bold mb-2">🌸 Special Bouquets</h3>
          <ul className="list-none">
            <li>Cute keychains</li>
            <li>Special Gift Gifts</li>
          </ul>
        </div>
        <div>
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
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
