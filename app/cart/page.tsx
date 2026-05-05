"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("₱", "").replace(",", ""));
    return sum + price * (item.quantity ?? 1);
  }, 0);

  return (
    <main className="cart-page">

      <header>
        <h1>Mae Little Loops Studio</h1>
        <nav>
          
          <a href="/bouquets">Products</a>
          <a href="/about_us">About Us</a>
          <a href="/contact_us">Contact Us</a>
          {userEmail ? <a href="/dashboard">Profile</a> : <a href="/login">Sign In</a>}
        </nav>
        <div className="nav-right">
          <input type="text" placeholder="Search..." className="search-input" onKeyDown={(e) => { if(e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim().replace(/[<>"']/g, ""); if(q) router.push(`/search?q=${encodeURIComponent(q)}`); }}} />
          {userEmail ? (
            <>
              <span style={{fontSize:'12px', fontWeight:'bold', cursor:'pointer', color:'white', whiteSpace:'nowrap'}} onClick={() => router.push('/dashboard')}>👤 {userEmail.split('@')[0]}</span>
              <button className="logout-btn" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>Logout</button>
            </>
          ) : (
            <a href="/login" className="login-icon">👤</a>
          )}
          <span onClick={() => router.push("/cart")} style={{cursor:'pointer', color:'white'}}>
            🛒 {cart.length > 0 && <sup style={{background:'white', color:'#c44dff', borderRadius:'50%', padding:'1px 5px', fontSize:'10px', fontWeight:'bold'}}>{cart.length}</sup>}
          </span>
        </div>
      </header>

      <div className="cart-layout">
        <h2 className="cart-title">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>🛒 Your cart is empty</p>
            <button onClick={() => router.push("/bouquets")}>Start Shopping</button>
          </div>
        ) : (
          <>
            {cart.map((item, index) => (
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
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(index, (item.quantity ?? 1) - 1)}>−</button>
                      <span className="qty-num">{item.quantity ?? 1}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(index, (item.quantity ?? 1) + 1)}>+</button>
                    </div>
                  </div>
                </div>
                <div className="cart-item-right">
                  <p className="cart-item-subtotal">₱{(parseFloat(item.price.replace('₱','').replace(',','')) * (item.quantity ?? 1)).toFixed(2)}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(index)}>✕</button>
                </div>
              </div>
            ))}

            <div className="cart-footer-row">
              <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
              <div className="cart-total-row">
                <span>Total:</span>
                <strong>₱{total.toFixed(2)}</strong>
              </div>
              <button className="checkout-btn" onClick={() => router.push('/checkout')}>Checkout</button>
            </div>
          </>
        )}
      </div>
      <footer>
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p></div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>masarquemae65@gmail.com</p><p>09706383306</p><p>Masbate, Philippines</p></div>
      </footer>


    </main>
  );
}
