"use client";

export default function Keychain() {
  const keychains = [
    { name: "Bunny Love Keychain", price: "₱80.00" },
    { name: "Star Charm Keychain", price: "₱90.00" },
    { name: "Mini Bear Keychain", price: "₱100.00" },
    { name: "Heart Bloom Keychain", price: "₱85.00" },
    { name: "Pastel Cloud Keychain", price: "₱95.00" },
    { name: "Rainbow Drop Keychain", price: "₱110.00" },
    { name: "Flower Petal Keychain", price: "₱75.00" },
    { name: "Sweet Bow Keychain", price: "₱88.00" },
  ];

  return (
    <main className="min-h-screen bg-gray-200">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>

       <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <input name="q" type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`; }} />
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

      {/* DESCRIPTION */}
      <div className="description-banner">
        <p>Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
      </div>

      {/* KEYCHAINS */}
      <section className="flex justify-center gap-8 flex-wrap py-16">
        {keychains.map((item, index) => (
          <div key={index} className="bg-pink-200 rounded-2xl p-6 w-64 text-center shadow-md">
            <div className="mx-auto w-[120px] h-[120px] bg-pink-300 rounded-xl flex items-center justify-center text-4xl">🔑</div>
            <h2 className="mt-4 font-semibold">{item.name}</h2>
            <p className="text-pink-600 font-bold">{item.price}</p>
            <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full">
              ADD TO CART
            </button>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="bg-pink-300 py-10 px-10 flex justify-between flex-wrap">
        <div>
          <h2 className="font-bold mt-2">Mae Little Loops Studio</h2>
        </div>
        <div>
          <h3 className="font-bold mb-2">🌸 Special Bouquets</h3>
          <ul className="list-disc ml-5">
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
