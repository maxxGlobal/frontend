// src/pages/homepage/Helpers/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getActiveCart } from "../../../services/cart/getActiveCart";
import { addCartItem } from "../../../services/cart/addItem";
import { updateCartItem } from "../../../services/cart/updateItem";
import { removeCartItem } from "../../../services/cart/removeItem";
import { clearCart as clearCartService } from "../../../services/cart/clearCart";
import type {
  CartResponse,
  CartItemResponse,
  CartItemRequest,
  CartItemUpdateRequest,
} from "../../../types/cart";

interface CartContextValue {
  cart: CartResponse | null;
  items: CartItemResponse[];
  loading: boolean;
  error: string | null;
  dealerId: number | null;
  
  // CRUD işlemleri
  refresh: () => Promise<void>;
  addItem: (request: Omit<CartItemRequest, "dealerId">) => Promise<void>;
  updateItem: (itemId: number, request: CartItemUpdateRequest) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getDealerId(): number | null {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const id = user?.dealer?.id;
    return typeof id === "number" && Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealerId] = useState<number | null>(getDealerId());

  const refresh = useCallback(async () => {
    if (!dealerId) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getActiveCart(dealerId);
      setCart(data);
    } catch (err: any) {
      console.error("Sepet yüklenirken hata:", err);
      
      // 404 - Sepet bulunamadı (boş sepet)
      if (err?.response?.status === 404) {
        setCart(null);
        setError(null);
      } else {
        setError(err?.response?.data?.message || err?.message || "Sepet yüklenemedi");
      }
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  const addItem = useCallback(
    async (request: Omit<CartItemRequest, "dealerId">) => {
      if (!dealerId) {
        throw new Error("Bayi bilgisi bulunamadı");
      }

      const fullRequest: CartItemRequest = {
        ...request,
        dealerId,
      };

      const response = await addCartItem(fullRequest);
      setCart(response);
      
      // Sepet değişikliği event'i
      window.dispatchEvent(new Event("cart:changed"));
    },
    [dealerId]
  );

  const updateItem = useCallback(
    async (itemId: number, request: CartItemUpdateRequest) => {
      const response = await updateCartItem(itemId, request);
      setCart(response);
      
      // Sepet değişikliği event'i
      window.dispatchEvent(new Event("cart:changed"));
    },
    []
  );

  const removeItem = useCallback(async (itemId: number) => {
    await removeCartItem(itemId);
    
    // Sepetten çıkarıldıktan sonra yenile
    await refresh();
    
    // Sepet değişikliği event'i
    window.dispatchEvent(new Event("cart:changed"));
  }, [refresh]);

  const clearCart = useCallback(async () => {
    if (!dealerId) {
      throw new Error("Bayi bilgisi bulunamadı");
    }

    await clearCartService(dealerId);
    setCart(null);
    
    // Sepet değişikliği event'i
    window.dispatchEvent(new Event("cart:changed"));
  }, [dealerId]);

  // İlk yükleme
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sepet değişikliklerini dinle
  useEffect(() => {
    const handler = () => {
      refresh();
    };

    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, [refresh]);

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const value: CartContextValue = {
    cart,
    items,
    loading,
    error,
    dealerId,
    refresh,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}