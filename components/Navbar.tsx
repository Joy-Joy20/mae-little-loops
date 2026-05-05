"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

type NavbarProps = { activePage?: string; };

export default function Navbar({ activePage }: NavbarProps) {
  const router = useRouter();
  const { cart } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchQuery.trim().replace(/[<>"']/g, "");
      if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header className="navbar">
      {/* LEFT: Brand */}
      <a href="/shop_now" className="navbar-brand">Mae Little Loops Studio</a>

      {/* CENTER: Nav Links */}
      <nav className={`navbar-nav ${showMobileMenu ? "open" : ""}`}>
        <a href="/shop_now" className={activePage === "home" ? "nav-link active" : "nav-link"}>Home</a>

        {/* Products Dropdown */}
        <div className="nav-dropdown" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
          <a href="/bouquets" className={activePage === "products" ? "nav-link active" : "nav-link"}>
            Products ▾
          </a>
          {showDropdown && (
            <div className="dropdown-menu">
              <a href="/bouquets" className="dropdown-item">💐 Bouquets</a>
              <a href="/keychain" className="dropdown-item">🔑 Keychain</a>
            </div>
          )}
        </div>

        <a href="/about_us" className={activePage === "about" ? "nav-link active" : "nav-link"}>About Us</a>
        <a href="/contact_us" className={activePage === "contact" ? "nav-link active" : "nav-link"}>Contact Us</a>
        {userEmail ? (
          <a href="/dashboard" className={activePage === "dashboard" ? "nav-link active" : "nav-link">Profile</a>
        ) : (
          <a href="/login" className="nav-link">Sign In</a>
        )}
      </nav>

      {/* RIGHT: Search + User + Cart */}
      <div className="navbar-right">
        <input
          type="text"
          placeholder="Search..."
          className="navbar-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />

        {userEmail ? (
          <>
            <span className="navbar-user" onClick={() => router.push("/dashboard")}>
              👤 {userEmail.split("@")[0]}
            </span>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <a href="/login" className="navbar-login">👤 Login</a>
        )}

        <button className="navbar-cart" onClick={() => router.push("/cart")}>
          🛒
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </button>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
