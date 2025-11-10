// src/services/orders/calculate.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type OrderProductRequest = {
  productPriceId: number | null;
  quantity: number;
};

export type OrderRequest = {
  dealerId: number;
  products: OrderProductRequest[];
  discountId?: number;
  notes?: string;
};

export type OrderItemCalculation = {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
  availableStock: number;
  discountAmount: number;
  stockStatus: string;
};

export type OrderCalculationResponse = {
  subtotal: number;
  discountAmount: number;
  totalAmount?: number;
  currency: string;
  totalItems: number;
  itemCalculations?: OrderItemCalculation[];
  stockWarnings: string[];
  discountDescription?: string;
};

/**
 * Sipariş tutarını hesapla (indirim dahil)
 */
export async function calculateOrder(
  request: OrderRequest,
  opts?: { signal?: AbortSignal }
): Promise<OrderCalculationResponse> {
  const res = await api.post<ApiEnvelope<OrderCalculationResponse>>(
    "/orders/calculate",
    request,
    { signal: opts?.signal }
  );
  return res.data.data;
}

/**
 * Sipariş önizlemesi oluştur
 */
export async function previewOrder(
  request: OrderRequest,
  opts?: { signal?: AbortSignal }
): Promise<OrderCalculationResponse> {
  const res = await api.post<ApiEnvelope<OrderCalculationResponse>>(
    "/orders/preview",
    request,
    { signal: opts?.signal }
  ); 
return res.data as unknown as OrderCalculationResponse;
}