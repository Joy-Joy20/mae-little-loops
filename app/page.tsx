import Image from "next/image";

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <Image
          src="/logo.png"
          alt="Mae Little Loops Studio"
          width={600}
          height={350}
          priority
        />
        <p className="home-desc">Handmade with love 🌸 — Explore our collection of beautiful bouquets and cute keychains perfect for any occasion.</p>
        <a href="/shop_now" className="start-btn">SHOP NOW</a>
      </div>
    </div>
  );
}
