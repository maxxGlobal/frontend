// src/services/cart/clearCart.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export async function clearCart(
  dealerId: number,
  opts?: { signal?: AbortSignal }
): Promise<void> {
  await api.delete<ApiEnvelope<null> | void>(
    `cart`,
    {
      params: { dealerId },
      signal: opts?.signal,
    }
  );
}

export default clearCart;