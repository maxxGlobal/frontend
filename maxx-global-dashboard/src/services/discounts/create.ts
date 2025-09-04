// src/services/discounts/create.ts
import api from "../../lib/api";
import type { Discount, DiscountCreateRequest } from "../../types/discount";

export async function createDiscount(
  payload: DiscountCreateRequest
): Promise<Discount> {
  const res = await api.post("/discounts", payload);

  const raw = (res as any)?.data?.data ?? (res as any)?.data;

  return raw as Discount;
}
