"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
  name: string;
  price: string;
  quantity?: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.findIndex((i) => i.name === item.name);
      let updated;
      if (existing >= 0) {
        updated = prev.map((i, idx) => idx === existing ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i);
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(index: number) {
    setCart((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem('cart');
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
