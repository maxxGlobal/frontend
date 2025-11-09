import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export interface DealerVariantPrice {
  variantId: number;
  variantSku: string;
  variantSize: string | null;
  prices: Array<{
    currency: string;
    amount: number | null;
    validFrom?: string | null;
    validUntil?: string | null;
    isActive?: boolean | null;
  }>;
}

export interface DealerProductVariantResponse {
  productId: number;
  productName: string;
  productCode: string;
  dealerId: number;
  dealerName: string;
  variants: DealerVariantPrice[];
}

export interface UpdateDealerVariantPriceRequest {
  variants: Array<{
    variantId: number;
    prices: Array<{
      currency: string;
      amount: number;
      validFrom: string;
      validUntil: string | null;
      isActive: boolean;
    }>;
  }>;
}

export async function getDealerProductVariants(
  productId: number,
  dealerId: number
): Promise<DealerProductVariantResponse> {
  const res = await api.get<ApiEnvelope<DealerProductVariantResponse>>(
    `/product-prices/product/${productId}/dealer/${dealerId}/variants`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Varyant fiyatları alınamadı");
  }

  return res.data.data;
}

export async function updateDealerProductVariants(
  productId: number,
  dealerId: number,
  payload: UpdateDealerVariantPriceRequest
): Promise<DealerProductVariantResponse> {
  const res = await api.put<ApiEnvelope<DealerProductVariantResponse>>(
    `/product-prices/product/${productId}/dealer/${dealerId}/variants`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Varyant fiyatları güncellenemedi");
  }

  return res.data.data;
}
