// src/services/cart/removeItem.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export async function removeCartItem(
  itemId: number,
  opts?: { signal?: AbortSignal }
): Promise<void> {
  const res = await api.delete<ApiEnvelope<null> | ApiEnvelope<void> | void>(
    `cart/items/${itemId}`,
    {
      signal: opts?.signal,
    }
  );

  const payload = (res as any)?.data;

  if (payload && typeof payload === "object") {
    if (payload.success === false) {
      throw new Error(payload?.message || "Sepetten ürün silinirken bir hata oluştu.");
    }
  }
}

export default removeCartItem;
