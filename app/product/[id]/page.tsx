"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext";
import { allProducts } from "../../../lib/products";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const product = allProducts.find((p) => p.id === params.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  if (!product) {
    return (
      <main className="detail-page">
        <div className="detail-not-found">
          <p>Product not found.</p>
          <button onClick={() => router.back()}>← Go Back</button>
        </div>
      </main>
    );
  }

  function handleAddToCart() {
    if (!userEmail) { router.push("/login"); return; }
    addToCart({ name: product!.name, price: product!.price, img: product!.img });
    alert(`${product!.name} added to cart!`);
  }

  function handleBuyNow() {
    if (!userEmail) { router.push("/login"); return; }
    addToCart({ name: product!.name, price: product!.price, img: product!.img });
    router.push("/checkout");
  }

  return (
    <main className="detail-page">

      {/* NAVBAR */}
      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div className="nav-right">
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer', color:'white'}}>🛒</span>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <button onClick={() => router.back()} className="back-btn">← Back to Products</button>
        <span className="breadcrumb-path">
          <a href="/shop_now">Home</a> / <a href="/bouquets">Products</a> / {product.name}
        </span>
      </div>

      {/* PRODUCT DETAIL */}
      <section className="detail-content">

        {/* IMAGE */}
        <div className="detail-img-wrapper">
          {product.img ? (
            <Image src={product.img} alt={product.name} width={320} height={320} className="detail-img" />
          ) : (
            <div className="detail-img-placeholder">
              {product.category === "bouquet" ? "🌸" : "🔑"}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="detail-info">
          <span className="detail-category">{product.category === "bouquet" ? "💐 Bouquet" : "🔑 Keychain"}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{product.price}</p>
          <p className="detail-description">{product.description}</p>

          <div className="detail-btns">
            <button className="detail-add-btn" onClick={handleAddToCart}>Add to Cart</button>
            <button className="detail-buy-btn" onClick={handleBuyNow}>Buy Now</button>
          </div>
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
          <p>📧 maelittleloops@gmail.com</p>
          <p>📱 09XXXXXXXXX</p>
        </div>
      </footer>

    </main>
  );
}
