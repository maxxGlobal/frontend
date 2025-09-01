import api from "../../lib/api";

import type {
  ProductPrice,
  BulkUpdateRequest,
  ApiResponse,
} from "../../types/product-prices";

// 🔹 Toplu fiyat güncelleme servisi
export async function bulkUpdatePrices(req: BulkUpdateRequest) {
  const res = await api.put<ApiResponse<ProductPrice[]>>(
    `/product-prices/bulk-update`,
    req
  );
  return res.data.data;
}
