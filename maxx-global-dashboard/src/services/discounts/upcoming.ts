// src/services/discounts/upcoming.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";

/**
 * GET /discounts/upcoming
 * Response: { success, message, data: Discount[] }
 * Wrapper'lı/düz cevaplar için defansif unwrap.
 */
export async function listUpcomingDiscounts(): Promise<Discount[]> {
  const res = await api.get("/discounts/upcoming");
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as Discount[]) : [];
}
