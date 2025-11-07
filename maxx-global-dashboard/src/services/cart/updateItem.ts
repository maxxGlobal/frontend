// src/services/cart/updateItem.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CartItemRequest, CartResponse } from "../../types/cart";

export async function updateCartItem(
  itemId: number,
  body: CartItemRequest,
  opts?: { signal?: AbortSignal }
): Promise<CartResponse> {
  const res = await api.put<ApiEnvelope<CartResponse> | CartResponse>(
    `cart/items/${itemId}`,
    body,
    {
      signal: opts?.signal,
    }
  );

  const payload = (res as any)?.data?.data ?? (res as any)?.data;

  if (!payload) {
    throw new Error("Sepet güncellenirken beklenmeyen bir yanıt alındı.");
  }

  return payload as CartResponse;
}

export default updateCartItem;
