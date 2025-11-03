import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isAxiosError } from "axios";
import type { ReactNode } from "react";
import type {
  CartItemRequest,
  CartItemResponse,
  CartItemUpdateRequest,
  CartResponse,
} from "../../../types/cart";
import { getActiveCart } from "../../../services/cart/getActiveCart";
import { addCartItem } from "../../../services/cart/addItem";
import { updateCartItem } from "../../../services/cart/updateItem";
import { removeCartItem } from "../../../services/cart/removeItem";

function resolveDealerId(candidate?: number | null): number | null {
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const userDealerId = storedUser?.dealer?.id;
    if (
      typeof userDealerId === "number" &&
      Number.isFinite(userDealerId) &&
      userDealerId > 0
    ) {
      return userDealerId;
    }
  } catch {
    /* empty */
  }

  const storedDealerId =
    localStorage.getItem("dealerId") ?? localStorage.getItem("selectedDealerId");
  if (storedDealerId) {
    const parsed = Number(storedDealerId);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

type RefreshOptions = {
  dealerId?: number | null;
  signal?: AbortSignal;
};

type AddItemOptions = {
  productPriceId: number;
  quantity?: number;
  dealerId?: number | null;
  signal?: AbortSignal;
};

type UpdateItemOptions = {
  itemId: number;
  quantity: number;
  dealerId?: number | null;
  signal?: AbortSignal;
};

type RemoveItemOptions = {
  itemId: number;
  dealerId?: number | null;
  signal?: AbortSignal;
};

export type CartContextType = {
  cart: CartResponse | null;
  items: CartItemResponse[];
  loading: boolean;
  error: string | null;
  dealerId: number | null;
  setDealerId: (dealerId: number | null) => void;
  refresh: (options?: RefreshOptions) => Promise<CartResponse | null>;
  addItem: (options: AddItemOptions) => Promise<CartResponse>;
  updateItem: (options: UpdateItemOptions) => Promise<CartResponse>;
  removeItem: (options: RemoveItemOptions) => Promise<CartResponse | null>;
};

const CartContext = createContext<CartContextType>({
  cart: null,
  items: [],
  loading: false,
  error: null,
  dealerId: null,
  setDealerId: () => {},
  refresh: async () => null,
  addItem: async () => {
    throw new Error("Cart context henüz hazırlanmadı.");
  },
  updateItem: async () => {
    throw new Error("Cart context henüz hazırlanmadı.");
  },
  removeItem: async () => {
    throw new Error("Cart context henüz hazırlanmadı.");
  },
});

function normalizeCart(response: CartResponse): CartResponse {
  const items = Array.isArray(response.items)
    ? response.items.map((item) => ({
        ...item,
        unitPrice: normalizeDecimal(item.unitPrice),
        totalPrice: normalizeDecimal(item.totalPrice),
        availableStock: normalizeNullableNumber(item.availableStock),
        quantity: normalizeNumber(item.quantity, 1),
        productId: normalizeNumber(item.productId),
        productVariantId: normalizeNullableNumber(item.productVariantId),
        productPriceId: normalizeNumber(item.productPriceId),
      }))
    : [];

  return {
    ...response,
    subtotal: normalizeDecimal(response.subtotal),
    totalItems: normalizeNumber(response.totalItems, 0),
    items,
  };
}

function normalizeDecimal(value: unknown): number | string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : String(value);
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dealerId, setDealerIdState] = useState<number | null>(() => resolveDealerId());

  const setDealerId = useCallback((next: number | null) => {
    setDealerIdState(next ?? null);
    if (next) {
      localStorage.setItem("selectedDealerId", String(next));
    }
  }, []);

  const refresh = useCallback(
    async (options?: RefreshOptions): Promise<CartResponse | null> => {
      const targetDealerId = resolveDealerId(options?.dealerId ?? dealerId);

      if (!targetDealerId) {
        setCart(null);
        setError("Bayi bilgisi bulunamadı.");
        return null;
      }

      setLoading(true);

      try {
        const response = await getActiveCart(targetDealerId, {
          signal: options?.signal,
        });
        const normalized = normalizeCart(response);
        setCart(normalized);
        setError(null);
        return normalized;
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
          return null;
        }

        if (isAxiosError(err) && err.response?.status === 404) {
          setCart(null);
          setError(null);
          return null;
        }

        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Sepet bilgileri alınırken hata oluştu.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dealerId]
  );

  const addItem = useCallback(
    async (options: AddItemOptions): Promise<CartResponse> => {
      const quantity = Math.max(1, options.quantity ?? 1);
      const targetDealerId = resolveDealerId(options.dealerId ?? dealerId);

      if (!targetDealerId) {
        throw new Error("Bayi bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const payload: CartItemRequest = {
        dealerId: targetDealerId,
        productPriceId: options.productPriceId,
        quantity,
      };

      const response = await addCartItem(payload, {
        signal: options.signal,
      });

      const normalized = normalizeCart(response);
      setCart(normalized);
      setError(null);
      return normalized;
    },
    [dealerId]
  );

  const updateItem = useCallback(
    async (options: UpdateItemOptions): Promise<CartResponse> => {
      const quantity = Math.max(1, Math.floor(options.quantity));
      const targetDealerId = resolveDealerId(options.dealerId ?? dealerId);

      if (!targetDealerId) {
        throw new Error("Bayi bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const payload: CartItemUpdateRequest = {
        quantity,
      };

      const response = await updateCartItem(options.itemId, payload, {
        signal: options.signal,
      });

      const normalized = normalizeCart(response);
      setCart(normalized);
      setError(null);
      return normalized;
    },
    [dealerId]
  );

  const removeItem = useCallback(
    async (options: RemoveItemOptions): Promise<CartResponse | null> => {
      const targetDealerId = resolveDealerId(options.dealerId ?? dealerId);

      if (!targetDealerId) {
        throw new Error("Bayi bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      }

      await removeCartItem(options.itemId, { signal: options.signal });

      const refreshed = await refresh({ dealerId: targetDealerId });
      setError(null);
      return refreshed;
    },
    [dealerId, refresh]
  );

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal }).catch((err) => {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
        return;
      }
      console.error("Sepet bilgileri alınırken hata oluştu:", err);
    });
    return () => controller.abort();
  }, [refresh]);

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const value: CartContextType = useMemo(
    () => ({
      cart,
      items,
      loading,
      error,
      dealerId,
      setDealerId,
      refresh,
      addItem,
      updateItem,
      removeItem,
    }),
    [
      cart,
      items,
      loading,
      error,
      dealerId,
      setDealerId,
      refresh,
      addItem,
      updateItem,
      removeItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
