import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  getCart,
  syncCartFromBackend,
} from "../../../services/cart/storage";
import type { CartItem } from "../../../services/cart/storage";

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

  useEffect(() => {
    let disposed = false;

    const update = () => {
      if (!disposed) {
        setItems(getCart());
      }
    };

    window.addEventListener("storage", update);
    window.addEventListener("cart:changed", update);

    const controller = new AbortController();

    syncCartFromBackend({ signal: controller.signal })
      .catch((error: any) => {
        if (disposed) return;
        if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Sepet bilgileri alınırken hata oluştu:", error);
      })
      .finally(update);

    return () => {
      disposed = true;
      controller.abort();
      window.removeEventListener("storage", update);
      window.removeEventListener("cart:changed", update);
    };
  }, []);

  return (
    <CartContext.Provider value={{ items, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => useContext(CartContext);
