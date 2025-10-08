import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OrderResponse } from "../../types/order";

// ✅ Backend'in beklediği request tipi
export type OrderEditApprovalRequest = {
  approved: boolean;
  customerNote?: string; // Opsiyonel not
};

/**
 * Düzenlenmiş siparişi müşteri onaylar
 */
export async function approveEditedOrder(orderId: number): Promise<OrderResponse> {
  const requestBody: OrderEditApprovalRequest = {
    approved: true, // ✅ Onay için true
    customerNote: undefined, // Opsiyonel
  };

  const res = await api.put<ApiEnvelope<OrderResponse>>(
    `/orders/edited/${orderId}/approve`,
    requestBody
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Onaylama başarısız");
  }

  return res.data.data;
}

/**
 * Düzenlenmiş siparişi müşteri reddeder
 */
export async function rejectEditedOrder(
  orderId: number,
  rejectionReason: string
): Promise<OrderResponse> {
  const requestBody: OrderEditApprovalRequest = {
    approved: false, // ✅ Red için false
    customerNote: rejectionReason, // ✅ Red nedeni customerNote olarak
  };

  const res = await api.put<ApiEnvelope<OrderResponse>>(
    `/orders/edited/${orderId}/approve`, // ✅ Aynı endpoint!
    requestBody
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Reddetme başarısız");
  }

  return res.data.data;
}