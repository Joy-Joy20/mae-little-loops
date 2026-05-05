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
        <div className="footer-col"><h3>Mae Little Loops Studio</h3><p>Handmade with love</p>
          <p style={{margin:"12px 0 6px",fontWeight:"600",fontSize:"13px",opacity:0.9}}>Follow Us</p>
          <div style={{display:"flex",gap:"12px"}}>
            <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer" title="Facebook" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@mae.littleloops" target="_blank" rel="noopener noreferrer" title="TikTok" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
            <a href="mailto:masarquemae65@gmail.com" title="Email" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"white",textDecoration:"none",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.4)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col"><h3>Categories</h3><a href="/bouquets">Bouquets</a><a href="/keychain">Keychains</a></div>
        <div className="footer-col"><h3>Contact</h3><p>masarquemae65@gmail.com</p><p>09706383306</p><p>Masbate, Philippines</p></div>
        <div className="footer-bottom" style={{gridColumn:'1/-1',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'16px',fontSize:'13px',opacity:0.8}}>
          &copy; {new Date().getFullYear()} Mae Little Loops Studio. All Rights Reserved.
        </div>
      </footer>





    </main>
  );
}
