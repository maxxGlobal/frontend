// src/services/discounts/restore.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";

export async function restoreDiscount(id: number): Promise<Discount> {
  const res = await api.post(`/discounts/${id}/restore`);
  const raw = (res as any)?.data?.data ?? (res as any)?.data;
  return raw as Discount;
}
