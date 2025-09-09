import api from "../../lib/api";
import type { LowStockProduct } from "../../types/product";

export async function listLowStockProducts(
  threshold: number
): Promise<LowStockProduct[]> {
  const res = await api.get<{
    success: boolean;
    message: string | null;
    data: LowStockProduct[];
  }>("/products/low-stock", {
    params: { threshold },
  });

  return res.data.data;
}
