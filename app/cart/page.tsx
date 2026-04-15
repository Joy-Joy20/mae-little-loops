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
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') router.push(`/search?q=${(e.target as HTMLInputElement).value}`); }} />
          <a href="/login" className="login-icon">👤</a>
          <span>🛒 {cart.length > 0 && <sup style={{background:'#ff1493', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'11px'}}>{cart.length}</sup>}</span>
        </div>
      </header>

      <section className="cart-content">
        <h2 className="cart-title">🛒 Your Cart</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button onClick={() => router.push("/bouquets")}>SHOP NOW</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  {item.img ? (
                    <Image src={item.img} alt={item.name} width={70} height={70} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-placeholder">🌸</div>
                  )}
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{item.price}</p>
                    <p className="cart-item-qty">Qty: {item.quantity ?? 1}</p>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(index)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <p>Total: <strong>₱{total.toFixed(2)}</strong></p>
            </div>

            <div className="cart-actions">
              <button className="clear-btn" onClick={clearCart}>CLEAR CART</button>
              <button className="checkout-btn" onClick={() => alert("Checkout coming soon!")}>CHECKOUT</button>
            </div>
          </>
        )}
      </section>

      <footer>
        <h2>Mae Little Loops Studio</h2>
        <div>
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
        </div>
      </footer>

    </main>
  );
}
