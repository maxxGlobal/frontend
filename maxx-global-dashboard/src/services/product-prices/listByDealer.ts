import api from "../../lib/api";
import type { ApiResponse, PageResponse } from "../../lib/types";
import type { ProductPrice } from "../../types/product-prices";

// 🔹 Bayiye göre fiyatlar
export async function listPricesByDealer(
  dealerId: number,
  page = 0,
  size = 20
) {
  const res = await api.get<ApiResponse<PageResponse<ProductPrice>>>(
    `/product-prices/dealer/${dealerId}?page=${page}&size=${size}`
  );
  return res.data.data;
}
