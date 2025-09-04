// src/services/discounts/get.ts
import api from "../../lib/api";
import type { Discount } from "../../types/discount";

export async function getDiscount(id: number) {
  const res = await api.get<{ data: Discount }>(`/discounts/${id}`);
  return res.data.data;
}
