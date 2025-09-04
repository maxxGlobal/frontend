// src/services/discounts/list-by-product.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";

/**
 * GET /discounts/product/{productId}?dealerId=...
 * Response wrapper: { success, message, data: Discount[] }
 */
export async function listDiscountsByProduct(
  productId: number,
  dealerId?: number
): Promise<Discount[]> {
  const res = await api.get(`/discounts/product/${productId}`, {
    params: dealerId ? { dealerId } : undefined,
  });
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as Discount[]) : [];
}
