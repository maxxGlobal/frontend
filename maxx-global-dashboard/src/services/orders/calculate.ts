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
  unitPrice: number | null;
  totalPrice: number | null;
  inStock: boolean;
  availableStock: number;
  discountAmount: number | null;
  stockStatus: string;
  productVariantId?: number | null;
  variantSku?: string | null;
  variantSize?: string | null;
};

export type OrderCalculationResponse = {
  subtotal: number | null;
  discountAmount: number | null;
  totalAmount: number | null;
  currency: string;
  totalItems: number;
  itemCalculations?: OrderItemCalculation[];
  stockWarnings: string[];
  discountDescription?: string | null;
};

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function normalizeCount(value: unknown, fallback = 0): number {
  const numeric = normalizeNumber(value);
  return numeric ?? fallback;
}

function normalizeOrderItemCalculation(item: any): OrderItemCalculation {
  const productVariantId = normalizeNumber(item?.productVariantId);
  return {
    productId: normalizeCount(item?.productId),
    productName: String(item?.productName ?? ""),
    productCode: String(item?.productCode ?? ""),
    quantity: normalizeCount(item?.quantity),
    unitPrice: normalizeNumber(item?.unitPrice),
    totalPrice: normalizeNumber(item?.totalPrice),
    inStock: Boolean(item?.inStock),
    availableStock: normalizeCount(item?.availableStock),
    discountAmount: normalizeNumber(item?.discountAmount),
    stockStatus: String(item?.stockStatus ?? ""),
    productVariantId: productVariantId ?? null,
    variantSku: item?.variantSku ?? null,
    variantSize: item?.variantSize ?? null,
  };
}

function normalizeOrderCalculationResponse(data: any): OrderCalculationResponse {
  const currency = typeof data?.currency === "string" ? data.currency : "TRY";
  const totalItems = normalizeCount(data?.totalItems);

  return {
    subtotal: normalizeNumber(data?.subtotal),
    discountAmount: normalizeNumber(data?.discountAmount),
    totalAmount: normalizeNumber(data?.totalAmount),
    currency,
    totalItems,
    itemCalculations: Array.isArray(data?.itemCalculations)
      ? data.itemCalculations.map(normalizeOrderItemCalculation)
      : [],
    stockWarnings: Array.isArray(data?.stockWarnings)
      ? data.stockWarnings.filter((warning: unknown): warning is string => typeof warning === "string")
      : [],
    discountDescription:
      typeof data?.discountDescription === "string" && data.discountDescription.trim().length
        ? data.discountDescription
        : null,
  };
}

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
  const rawData = (res.data as ApiEnvelope<OrderCalculationResponse>)?.data ?? res.data;
  return normalizeOrderCalculationResponse(rawData);
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
  const rawData = (res.data as ApiEnvelope<OrderCalculationResponse>)?.data ?? res.data;
  return normalizeOrderCalculationResponse(rawData);
}