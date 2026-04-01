import Image from "next/image";

export default function Bouquets() {
  const bouquets = [
    { name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png" },
    { name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png" },
    { name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png" },
    { name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png" },
    { name: "Pink Star Lily Bloom", price: "₱200.00", img: null },
    { name: "Pastel Twin Tulips", price: "₱250.00", img: null },
    { name: "Pure White Rosebud", price: "₱300.00", img: null },
    { name: "Pink Tulip Delight", price: "₱150.00", img: null },
  ];

  return (
    <main className="min-h-screen bg-gray-200">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-pink-300 shadow-md">
        <h1 className="font-bold text-lg">Mae Little Loops Studio</h1>

        <nav className="flex gap-6 font-medium">
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Bouquets</a>
          <a href="/keychain">Keychain</a>
        </nav>

        <div className="flex gap-4 items-center">
          <input type="text" placeholder="Search..." className="px-3 py-1 rounded-md border" />
          <span>🛒</span>
        </div>
      </header>

      {/* BOUQUETS */}
      <section className="flex justify-center gap-8 flex-wrap py-16">
        {bouquets.map((item, index) => (
          <div key={index} className="bg-pink-200 rounded-2xl p-6 w-64 text-center shadow-md">
            {item.img ? (
              <Image src={item.img} alt={item.name} width={120} height={120} className="mx-auto" />
            ) : (
              <div className="mx-auto w-[120px] h-[120px] bg-pink-300 rounded-xl flex items-center justify-center text-4xl">🌸</div>
            )}
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
          <Image src="/logo.png" alt="logo" width={80} height={80} />
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
