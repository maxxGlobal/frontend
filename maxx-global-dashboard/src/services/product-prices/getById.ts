import api from "../../lib/api";
import type { ApiResponse, PageResponse } from "../../lib/types";
import type {
  ProductPrice,
  BulkUpdateRequest,
} from "../../types/product-prices";

// 🔹 ID ile fiyat getir
export async function getProductPriceById(id: number) {
  const res = await api.get<ApiResponse<ProductPrice>>(`/product-prices/${id}`);
  return res.data.data;
}
