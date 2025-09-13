import api from "../../lib/api";
import type { StockMovementResponse } from "../../types/stock";
import type { ApiEnvelope } from "../common";
import type { PageResponse } from "../../types/paging";

export async function getStockMovementsByProduct(
  productId: number,
  page = 0,
  size = 20,
  sortDirection: "asc" | "desc" = "desc"
): Promise<PageResponse<StockMovementResponse>> {
  const res = await api.get<ApiEnvelope<PageResponse<StockMovementResponse>>>(
    `/stock/movements/product/${productId}`,
    {
      params: { page, size, sortDirection }
    }
  );
  return res.data.data;
}