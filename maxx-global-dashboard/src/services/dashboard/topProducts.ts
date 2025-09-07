import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { TopProduct } from "../../types/dashboard";

export async function listTopProducts(): Promise<TopProduct[]> {
  const res = await api.get<
    ApiEnvelope<{ products: TopProduct[] }> | { products: TopProduct[] }
  >("/admin/dashboard/charts/top-products");
  const payload = (res as any).data?.data ??
    (res as any).data ?? { products: [] };
  return payload.products ?? [];
}
