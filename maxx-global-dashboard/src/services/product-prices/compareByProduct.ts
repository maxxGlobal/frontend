import api from "../../lib/api";
import type { ApiResponse } from "../../lib/types";
import type { ProductPrice } from "../../types/product-prices";

// 🔹 Ürüne göre fiyat karşılaştırması
export async function comparePricesByProduct(productId: number) {
  const res = await api.get<ApiResponse<ProductPrice[]>>(
    `/product-prices/product/${productId}/comparison`
  );
  return res.data.data;
}
