"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext";

type Product = {
  id: string;
  name: string;
  price: string;
  img: string | null;
  category: string;
  description: string;
  stock: number;
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) setProduct(data);
      setLoading(false);
    }

    fetchProduct();
  }, [params.id]);

  async function handleAddToCart() {
    if (!userEmail) { router.push("/login"); return; }
    if (!product) return;
    await addToCart({ name: product.name, price: product.price, img: product.img });
    alert(`${product.name} added to cart!`);
  }

  async function handleBuyNow() {
    if (!userEmail) { router.push("/login"); return; }
    if (!product) return;
    await addToCart({ name: product.name, price: product.price, img: product.img });
    router.push("/checkout");
  }

  if (loading) return <div className="detail-loading">Loading...</div>;

  if (!product) return (
    <main className="detail-page">
      <div className="detail-not-found">
        <p>Product not found.</p>
        <button onClick={() => router.back()}>← Go Back</button>
      </div>
    </main>
  );

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
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push('/cart')} style={{cursor:'pointer'}}>🛒</span>
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
          <span className="detail-category">
            {product.category === "bouquet" ? "💐 Bouquet" : "🔑 Keychain"}
          </span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{product.price}</p>
          <p className="detail-description">{product.description}</p>
          <p className={`detail-stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : "❌ Out of Stock"}
          </p>

          <div className="detail-btns">
            <button className="detail-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </button>
            <button className="detail-buy-btn" onClick={handleBuyNow} disabled={product.stock === 0}>
              Buy Now
            </button>
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
