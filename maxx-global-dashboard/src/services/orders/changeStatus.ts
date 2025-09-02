import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse } from "../../types/order";

export async function changeOrderStatus(
  orderId: number,
  newStatus: string,
  statusNote: string
) {
  const res = await api.put<ApiEnvelope<OrderResponse>>(
    `/orders/admin/${orderId}/status`,
    null,
    { params: { newStatus, statusNote } }
  );
  if (!res.data.success)
    throw new Error(res.data.message || "Statü değişimi başarısız");
  return res.data.data;
}
