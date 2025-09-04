// src/services/discounts/update.ts
import api from "../../lib/api";
import type { Discount, DiscountUpdateRequest } from "../../types/discount";

/** PUT /discounts/:id  -> wrapper { success, data: Discount } */
export async function updateDiscount(
  id: number,
  payload: DiscountUpdateRequest
): Promise<Discount> {
  const res = await api.put(`/discounts/${id}`, payload);
  const raw = (res as any)?.data?.data ?? (res as any)?.data; // wrapper/düz
  return raw as Discount;
}
