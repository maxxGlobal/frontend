// src/services/orders/approve.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse } from "../../types/order";

export async function approveOrder(orderId: number, adminNote: string) {
  try {
    const res = await api.put<ApiEnvelope<OrderResponse>>(
      `/orders/admin/${orderId}/approve`,
      null,
      { params: { adminNote } }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Onay başarısız");
    }

    return res.data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
        `Onay başarısız (status ${err.response?.status || "??"})`
    );
  }
}
