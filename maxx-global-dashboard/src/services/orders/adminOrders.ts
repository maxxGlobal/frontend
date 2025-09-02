// src/services/orders/listAdminOrders.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type {
  ListAdminOrdersRequest,
  PageResponse,
  OrderResponse,
} from "../../types/order";

export async function listAdminOrders(params: ListAdminOrdersRequest) {
  const res = await api.get<ApiEnvelope<PageResponse<OrderResponse>>>(
    `/orders/admin`,
    {
      params,
    }
  );
  return res.data.data;
}
