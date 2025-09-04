// src/services/discounts/list-by-dealer.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";

/**
 * GET /discounts/dealer/{dealerId}
 * Response wrapper: { success, message, data: Discount[] }
 */
export async function listDiscountsByDealer(
  dealerId: number
): Promise<Discount[]> {
  const res = await api.get(`/discounts/dealer/${dealerId}`);
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as Discount[]) : [];
}
