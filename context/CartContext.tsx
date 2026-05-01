"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type CartItem = {
  id?: string;
  name: string;
  price: string;
  quantity?: number;
  img?: string | null;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (index: number) => Promise<void>;
  updateQuantity: (index: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  loadCart: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadCartFromSupabase(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadCartFromSupabase(uid);
      else setCart([]);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadCartFromSupabase(uid: string) {
    const { data } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    if (data) setCart(data.map((item) => ({
      id: item.id,
      name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      img: item.img,
    })));
  }

  async function loadCart() {
    if (userId) await loadCartFromSupabase(userId);
  }

  async function addToCart(item: CartItem) {
    if (!userId) {
      // fallback localStorage for non-logged in
      setCart((prev) => {
        const existing = prev.findIndex((i) => i.name === item.name);
        if (existing >= 0) return prev.map((i, idx) => idx === existing ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i);
        return [...prev, { ...item, quantity: 1 }];
      });
      return;
    }

    // Check if item already in cart
    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("product_name", item.name)
      .single();

    if (existing) {
      await supabase.from("cart").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart").insert([{
        user_id: userId,
        product_name: item.name,
        price: item.price,
        quantity: 1,
        img: item.img ?? null,
      }]);
    }
    await loadCartFromSupabase(userId);
  }

  async function removeFromCart(index: number) {
    const item = cart[index];
    if (userId && item.id) {
      await supabase.from("cart").delete().eq("id", item.id);
      await loadCartFromSupabase(userId);
    } else {
      setCart((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function updateQuantity(index: number, qty: number) {
    if (qty < 1) return;
    const item = cart[index];
    if (userId && item.id) {
      await supabase.from("cart").update({ quantity: qty }).eq("id", item.id);
      await loadCartFromSupabase(userId);
    } else {
      setCart((prev) => prev.map((i, idx) => idx === index ? { ...i, quantity: qty } : i));
    }
  }

  async function clearCart() {
    if (userId) {
      await supabase.from("cart").delete().eq("user_id", userId);
    }
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
