// src/services/orders/listAdminOrders.ts
import api from "../../lib/api";
import type { PageResponse, OrderResponse } from "../../types/order";
import type { ApiEnvelope } from "../common";

export interface ListAdminOrdersRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  status?: string;
  dealerId?: number;
  userId?: number;
  searchTerm?: string; // Arama terimi için eklendi
}

export async function listAdminOrders(params: ListAdminOrdersRequest) {
  // Boş parametreleri temizle
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const res = await api.get<ApiEnvelope<PageResponse<OrderResponse>>>(
    "/orders/admin/all",
    { params: cleanParams }
  );
  return res.data.data;
}
