// src/services/discounts/calculate.ts
import api from "../../lib/api";
import type {
  DiscountCalculationRequest,
  DiscountCalculationSuccess,
} from "../../types/discount";

/**
 * POST /discounts/calculate
 * Wrapper { success, data } ya da direkt obje dönebilir -> defansif unwrap
 */
export async function calculateDiscount(
  payload: DiscountCalculationRequest
): Promise<DiscountCalculationSuccess> {
  const res = await api.post("/discounts/calculate", payload);
  const raw = (res as any)?.data?.data ?? (res as any)?.data;
  return raw as DiscountCalculationSuccess;
}
