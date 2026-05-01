"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import BuyNowModal from "../../components/BuyNowModal";

type Product = {
  id: string;
  name: string;
  price: string;
  img: string | null;
  description?: string;
};

export default function Bouquets() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);

  const bouquets: Product[] = [
    {
      id: "1",
      name: "Rainbow Tulip Charm",
      price: "\u20B1200.00",
      img: "/Rainbow Tulip Charm.png",
      description:
        "A vibrant handmade crochet bouquet featuring colorful tulips in red, yellow, blue, and purple. Perfect as a gift or home decoration.",
    },
    {
      id: "2",
      name: "Pastel Blossom Bouquet",
      price: "\u20B1250.00",
      img: "/Pastel Blossom Bouquet.png",
      description:
        "A lovely pastel-colored crochet flower bouquet with soft pink and blue blossoms. Great for birthdays and special occasions.",
    },
    {
      id: "3",
      name: "Lavender Bell Flowers",
      price: "\u20B1300.00",
      img: "/Lavender Bell Flowers.png",
      description:
        "An elegant bouquet of handcrafted lavender bell-shaped flowers wrapped in premium tissue paper with a pink ribbon.",
    },
    {
      id: "4",
      name: "Mini White Pastel Flower Bouquet",
      price: "\u20B1150.00",
      img: "/Mini White Pastel Flower Bouquet.png",
      description:
        "A delicate mini bouquet of white pastel crochet flowers, perfect as a small gift or desk decoration.",
    },
    {
      id: "5",
      name: "Crimson Charm",
      price: "\u20B1200.00",
      img: "/Crimson Charm.png",
      description:
        "A bold and beautiful crimson crochet bouquet that makes a striking statement for any occasion.",
    },
    {
      id: "6",
      name: "Lavender Luxe",
      price: "\u20B1250.00",
      img: "/Lavender Luxe.png",
      description:
        "A luxurious lavender crochet bouquet with rich purple tones, perfect for anniversaries and special events.",
    },
    {
      id: "7",
      name: "Skyline Serenade",
      price: "\u20B1300.00",
      img: "/Skyline Serenade.png",
      description:
        "A dreamy blue-toned crochet bouquet inspired by the sky. A unique and calming gift for loved ones.",
    },
    {
      id: "8",
      name: "Pastel Rainbow",
      price: "\u20B1150.00",
      img: "/Pastel Rainbow.png",
      description:
        "A cheerful pastel rainbow crochet bouquet bursting with soft colors. Brings joy to any room or occasion.",
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProduct(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleAddToCart(name: string, price: string, img: string | null) {
    if (!userEmail) {
      router.push("/login");
      return;
    }

    addToCart({ name, price, img });
    setSelectedProduct(null);
    alert(`${name} added to cart!`);
  }

  function handleBuyNow(name: string, price: string, img: string | null) {
    if (!userEmail) {
      router.push("/login");
      return;
    }

    setSelectedProduct(null);
    setBuyNowProduct({ id: "", name, price, img });
  }

  return (
    <main className="bouquets-page">
      <BuyNowModal product={buyNowProduct} onClose={() => setBuyNowProduct(null)} />

      {selectedProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="product-modal-close"
            >
              ×
            </button>
            <div className="product-modal-image">
              {selectedProduct.img && (
                <Image
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
            <span className="product-modal-tag">Bouquet</span>
            <h2 className="product-modal-title">{selectedProduct.name}</h2>
            <p className="product-modal-price">{selectedProduct.price}</p>
            <p className="product-modal-description">{selectedProduct.description}</p>
            <div className="product-modal-actions">
              <button
                onClick={() =>
                  handleAddToCart(
                    selectedProduct.name,
                    selectedProduct.price,
                    selectedProduct.img,
                  )
                }
                className="add-btn"
              >
                Add to Cart
              </button>
              <button
                onClick={() =>
                  handleBuyNow(
                    selectedProduct.name,
                    selectedProduct.price,
                    selectedProduct.img,
                  )
                }
                className="buy-btn"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets" className="active-link">
            Products
          </a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        <div className="nav-right">
          <input
            name="q"
            type="text"
            placeholder="Search..."
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value
                  .trim()
                  .replace(/[<>"']/g, "");
                if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
              }
            }}
          />
          {userEmail ? (
            <>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  color: "white",
                  whiteSpace: "nowrap",
                }}
                onClick={() => router.push("/dashboard")}
              >
                User {userEmail.split("@")[0]}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="login-icon" title="Login">
              User
            </a>
          )}
          <span onClick={() => router.push("/cart")} style={{ cursor: "pointer", color: "white" }}>
            Cart {cart.length > 0 && <sup style={{ background: "white", color: "#c44dff", borderRadius: "50%", padding: "1px 5px", fontSize: "10px", fontWeight: "bold" }}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="category-bar">
        <a href="/bouquets" className="category-item active-category">Bouquets</a>
        <a href="/keychain" className="category-item">Keychain</a>
      </div>

      <div className="description-banner">
        <p>Handmade with love - Explore our collection of beautiful bouquets perfect for any occasion.</p>
      </div>

      <section className="products-section">
        <h2 className="section-title">Our Bouquets</h2>
        <p className="products-desc">
          Soft handmade bouquet picks styled to match the sweet look of the shop_now cards and buttons.
        </p>
        <div className="products-grid">
          {bouquets.map((item) => (
            <article
              key={item.id}
              className="product-card"
              onClick={() => setSelectedProduct(item)}
            >
              <div className="product-img-wrapper">
                {item.img ? (
                  <Image
                    src={item.img}
                    alt={item.name}
                    width={190}
                    height={190}
                    className="product-img"
                  />
                ) : (
                  <div className="product-img-placeholder">Flower</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price}</p>
                <div className="btn-row">
                  <button
                    className="add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item.name, item.price, item.img ?? null);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="buy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(item.name, item.price, item.img ?? null);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-col">
          <h3>Mae Little Loops Studio</h3>
          <p>Handmade with love</p>
        </div>
        <div className="footer-col">
          <h3>Categories</h3>
          <a href="/bouquets">Bouquets</a>
          <a href="/keychain">Keychains</a>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>maelittleloops@gmail.com</p>
          <p>09XXXXXXXXX</p>
          <p>Cebu City, Philippines</p>
        </div>
      </footer>
    </main>
  );
}

