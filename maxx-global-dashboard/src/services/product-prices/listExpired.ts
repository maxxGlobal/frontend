import api from "../../lib/api";
import type { ApiResponse } from "../../lib/types";
import type { ProductPrice } from "../../types/product-prices";

// 🔹 Süresi dolan fiyatlar
export async function listExpiredPrices() {
  const res = await api.get<ApiResponse<ProductPrice[]>>(
    `/product-prices/expired`
  );
  return res.data.data;
}
