// src/services/orders/listAdminOrders.ts
import api from "../../lib/api";
import type {
  ApiResponse,
  PageResponse,
  OrderResponse,
  OrderListParams,
} from "../../types/order";

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
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ""
    )
  );

  const res = await api.get<ApiResponse<PageResponse<OrderResponse>>>(
    "/orders/admin/all",
    { params: cleanParams }
  );
  return res.data.data;
}