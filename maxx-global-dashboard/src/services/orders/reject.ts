// src/services/orders/reject.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse } from "../../types/order";

export async function rejectOrder(orderId: number, rejectionReason: string) {
  try {
    const res = await api.put<ApiEnvelope<OrderResponse>>(
      `/orders/admin/${orderId}/reject`,
      null,
      { params: { rejectionReason } }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Reddetme başarısız");
    }

    return res.data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
        `Reddetme başarısız (status ${err.response?.status || "??"})`
    );
  }
}
