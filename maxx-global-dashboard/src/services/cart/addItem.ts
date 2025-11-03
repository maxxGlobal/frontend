// src/services/cart/addItem.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CartItemRequest, CartResponse } from "../../types/cart";

export async function addCartItem(
  body: CartItemRequest,
  opts?: { signal?: AbortSignal }
): Promise<CartResponse> {
  const res = await api.post<ApiEnvelope<CartResponse> | CartResponse>(
    "cart/items",
    body,
    {
      signal: opts?.signal,
    }
  );

  const payload = (res as any)?.data?.data ?? (res as any)?.data;

  if (!payload) {
    throw new Error("Sepete ürün eklenirken beklenmeyen bir yanıt alındı.");
  }

  return payload as CartResponse;
}

export default addCartItem;
