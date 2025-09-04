// src/services/orders/listAdminOrders.ts
import api from "../../lib/api";
import type {
  ApiResponse,
  PageResponse,
  OrderResponse,
  OrderListParams,
} from "../../types/order";

export async function listAdminOrders(params: OrderListParams) {
  const res = await api.get<ApiResponse<PageResponse<OrderResponse>>>(
    "/orders/admin/all",
    { params }
  );
  return res.data.data;
}
