"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("₱", "").replace(",", ""));
    return sum + price * (item.quantity ?? 1);
  }, 0);

  return (
    <main className="cart-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          <a href="/shop_now">Home</a>
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
        </nav>
        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'nowrap'}}>
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') router.push(`/search?q=${(e.target as HTMLInputElement).value}`); }} />
          <a href="/login" className="login-icon">👤</a>
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer'}}>
            🛒 {cart.length > 0 && <sup style={{background:'#f06292', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="cart-layout">

        {/* LEFT - CART ITEMS */}
        <div className="cart-items-col">
          <h2 className="cart-title">Your Cart</h2>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>🛒 Your cart is empty</p>
              <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-left">
                  {item.img ? (
                    <Image src={item.img} alt={item.name} width={80} height={80} style={{borderRadius:'12px', objectFit:'cover'}} />
                  ) : (
                    <div style={{width:'80px', height:'80px', background:'#fce4ec', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px'}}>🌸</div>
                  )}
                  <div>
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{item.price}</p>
                    <p className="cart-item-qty">Qty: {item.quantity ?? 1}</p>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(index)}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cart.map((item, index) => (
              <div key={index} className="summary-row">
                <span>{item.name} x{item.quantity ?? 1}</span>
                <span>{item.price}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={() => router.push('/checkout')}>Checkout</button>
            <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
          </div>
        )}

      </div>

      <footer>
        <div className="footer-col">
          <Image src="/logo.png" alt="logo" width={70} height={70} style={{borderRadius:'12px'}} />
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
