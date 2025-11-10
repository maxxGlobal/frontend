// src/services/orders/create.ts - DÜZELTILMIŞ VERSİYON
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

export type OrderResponse = {
  id: number;
  orderNumber: string;
  dealerName: string;
  dealerId: number;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productPriceId: number | null;
  }>;
  orderDate: string;
  orderStatus: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  hasDiscount: boolean;
  savingsAmount: number;
};

/**
 * Temel sipariş oluşturma
 */
export async function createOrder(
  request: OrderRequest,
  opts?: { signal?: AbortSignal }
): Promise<OrderResponse> {
  console.log("POST /orders payload →", request);
  try {
    const res = await api.post<ApiEnvelope<OrderResponse>>("/orders", request, {
      signal: opts?.signal,
      headers: { "Content-Type": "application/json" },
    });

    console.log("Order created successfully:", res.data.data);
    return res.data.data;
  } catch (e: any) {
    console.error(
      "Order creation error:",
      e?.response?.status,
      e?.response?.data || e?.message
    );
    throw e;
  }
}

/**
 * Sipariş oluşturma ile birlikte validation
 */
export async function createOrderWithValidation(
  request: OrderRequest,
  opts?: { signal?: AbortSignal }
): Promise<OrderResponse> {
  // Temel validasyonlar
  if (!request.dealerId || request.dealerId <= 0) {
    throw new Error("Geçerli bir bayi seçilmelidir");
  }

  if (!request.products || request.products.length === 0) {
    throw new Error("En az bir ürün seçilmelidir");
  }

  // Ürün validasyonları
  for (const product of request.products) {
    if (
      product.productPriceId !== null &&
      (!Number.isFinite(product.productPriceId) || product.productPriceId <= 0)
    ) {
      throw new Error("Geçersiz ürün fiyat ID'si");
    }

    if (!product.quantity || product.quantity <= 0) {
      throw new Error("Ürün miktarı 0'dan büyük olmalıdır");
    }

    if (product.quantity > 999) {
      throw new Error("Maksimum ürün miktarı 999'dur");
    }
  }

  // Maksimum ürün sayısı kontrolü
  if (request.products.length > 50) {
    throw new Error("Bir siparişte maksimum 50 farklı ürün olabilir");
  }

  // Sipariş oluştur
  return createOrder(request, opts);
}