import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse, PageResponse } from "../../types/order";
export async function listMyOrders(
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<PageResponse<OrderResponse>> {
  const res = await api.get<ApiEnvelope<PageResponse<OrderResponse>>>(
    "/orders/my-orders",
    {
      params: { page, size },
      signal,
    }
  );
  return res.data.data;
}
