// src/services/orders/ship.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse } from "../../types/order";

export async function shipOrder(orderId: number, statusNote: string) {
  try {
    const res = await api.put<ApiEnvelope<OrderResponse>>(
      `/orders/admin/${orderId}/status`,
      null,
      { params: { newStatus: "SHIPPED", statusNote } }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Kargolama başarısız");
    }

    return res.data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
        `Kargolama başarısız (status ${err.response?.status || "??"})`
    );
  }
}
