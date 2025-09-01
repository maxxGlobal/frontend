import api from "../../lib/api";
import type { PageResponse, ProductPrice } from "../../types/product-prices";
import type { ApiEnvelope } from "../../services/common";

export async function listAllProductPrices(page = 0, size = 10) {
  const res = await api.get<ApiEnvelope<PageResponse<ProductPrice>>>(
    `/product-prices?page=${page}&size=${size}`
  );
  return res.data.data;
}
