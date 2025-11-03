// src/services/cart/getActiveCart.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CartResponse } from "../../types/cart";

export async function getActiveCart(
  dealerId: number,
  opts?: { signal?: AbortSignal }
): Promise<CartResponse> {
  const res = await api.get<ApiEnvelope<CartResponse> | CartResponse>(
    "cart",
    {
      params: { dealerId },
      signal: opts?.signal,
    }
  );

  const payload = (res as any)?.data?.data ?? (res as any)?.data;

  if (!payload) {
    throw new Error("Sepet bilgileri alınırken beklenmeyen bir yanıt alındı.");
  }

  return payload as CartResponse;
}

export default getActiveCart;
