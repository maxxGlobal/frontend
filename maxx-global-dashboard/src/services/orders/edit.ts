// src/services/orders/edit.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse, EditOrderBody } from "../../types/order";

export async function editOrder(
  orderId: number,
  editReason: string,
  body: EditOrderBody
) {
  try {
    const res = await api.put<ApiEnvelope<OrderResponse>>(
      `/orders/admin/${orderId}/edit`,
      body,
      { params: { editReason } }
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Düzenleme başarısız");
    return res.data.data;
  } catch (err: any) {
    // backend error mesajını yukarı fırlat
    const msg =
      err?.response?.data?.message || err.message || "İstek başarısız";
    throw new Error(msg);
  }
}
