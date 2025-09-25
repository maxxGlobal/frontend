import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getCart } from "../../../services/cart/storage";

// Sepetteki tek item tipi
export type CartItem = { id: number; qty: number };

// Context’te tutulacak değerler
export type CartContextType = {
  /** Sepetteki tüm ürün id ve adet bilgileri */
  items: CartItem[];
  /** Storage’tan tekrar oku ve items’ı güncelle */
  refresh: () => void;
};

// Varsayılan değer (boş sepet)
const CartContext = createContext<CartContextType>({
  items: [],
  refresh: () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getCart());

  const refresh = () => setItems(getCart());

  // başka tablarda değişim olursa
  useEffect(() => {
    const handler = () => setItems(getCart());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <CartContext.Provider value={{ items, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => useContext(CartContext);
