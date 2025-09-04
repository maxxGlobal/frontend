// src/services/discounts/expired.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";
export async function listExpiredDiscounts(): Promise<Discount[]> {
  const res = await api.get("/discounts/expired");
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as Discount[]) : [];
}
