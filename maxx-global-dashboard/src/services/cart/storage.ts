// src/services/cart/storage.ts
import { getCurrentUser } from "../auth/authService";
import { addCartItem } from "./addItem";
import type { CartItemRequest } from "../../types/cart";

export type CartItem = {
  id: number;
  qty: number;
  /** Backend'de kullanılan ürün fiyatı ID'si */
  productPriceId?: number | null;
};

export interface AddToCartOptions {
  /** Ürünün backend fiyat ID'si */
  productPriceId?: number | null;
  /** İsteğe bağlı bayi ID'si – verilmezse giriş yapan kullanıcının bayi ID'si kullanılır */
  dealerId?: number | null;
  signal?: AbortSignal;
}

const KEY = "cartProducts";

function notify() {
  window.dispatchEvent(new Event("cart:changed"));
}

function resolveDealerId(explicit?: number | null): number | null {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit > 0) {
    return explicit;
  }

  const user = getCurrentUser();
  const dealerId = user?.dealer?.id;
  if (typeof dealerId === "number" && Number.isFinite(dealerId) && dealerId > 0) {
    return dealerId;
  }

  const storedDealerId = localStorage.getItem("dealerId") ?? localStorage.getItem("selectedDealerId");
  if (storedDealerId) {
    const parsed = Number(storedDealerId);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function getCart(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      id: Number(item?.id),
      qty: Number(item?.qty) || 0,
      productPriceId:
        item?.productPriceId !== undefined && item?.productPriceId !== null
          ? Number(item.productPriceId)
          : undefined,
    })) as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  notify();
}

export async function addToCart(
  id: number,
  qty = 1,
  options?: AddToCartOptions
): Promise<void> {
  const safeQty = Math.max(1, qty);
  const cart = getCart();
  const found = cart.find((i) => i.id === id);

  const resolvedProductPriceId =
    options?.productPriceId ?? found?.productPriceId ?? null;

  if (!resolvedProductPriceId || !Number.isFinite(resolvedProductPriceId)) {
    throw new Error("Ürün için fiyat bilgisi bulunamadı.");
  }

  const dealerId = resolveDealerId(options?.dealerId ?? null);

  if (!dealerId) {
    throw new Error("Bayi bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
  }

  const payload: CartItemRequest = {
    dealerId,
    productPriceId: resolvedProductPriceId,
    quantity: safeQty,
  };

  await addCartItem(payload, { signal: options?.signal });

  if (found) {
    found.qty += safeQty;
    found.productPriceId = resolvedProductPriceId;
  } else {
    cart.push({ id, qty: safeQty, productPriceId: resolvedProductPriceId });
  }

  setCart(cart);
}

export function updateQty(id: number, qty: number) {
  const cart = getCart().map((i) =>
    i.id === id ? { ...i, qty: Math.max(1, qty) } : i
  );
  setCart(cart);
}

export function removeFromCart(id: number) {
  setCart(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  setCart([]);
}
