// src/services/orders/getOrderById.ts
// src/services/orders/getOrderById.ts
import api from "../../lib/api";
import type { OrderResponse } from "../../types/order";

export async function getOrderById(id: number): Promise<OrderResponse> {
  const res = await api.get(`/orders/${id}`);
  return res.data.data; // <-- asıl sipariş burada
}
