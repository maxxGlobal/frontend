import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { DiscountEffectiveness } from "../../types/dashboard";

export async function listDiscountEffectiveness(
  limit = 10,
  days = 90
): Promise<DiscountEffectiveness> {
  const res = await api.get<
    ApiEnvelope<DiscountEffectiveness> | DiscountEffectiveness
  >(
    `/admin/dashboard/charts/discount-effectiveness?limit=${limit}&days=${days}`
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as DiscountEffectiveness;
}
