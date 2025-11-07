import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type ProductDealerPriceResponse = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  dealerId: number;
  dealerName: string;
  variantId?: number | null; // ✅ Variant ID eklendi
  variantSize?: string | null; // ✅ Variant size eklendi
  prices: Array<{
    currency: string;
    amount: number;
  }>;
  validFrom: string;
  validUntil: string | null;
  isValidNow: boolean;
};

/**
 * Belirli bir ürün ve bayi için fiyat bilgisini getirir
 * @param productId - Ürün ID
 * @param dealerId - Bayi ID
 * @param variantId - Opsiyonel: Variant ID (belirtilirse o varyantın fiyatını getirir)
 */
export async function getProductDealerPrice(
  productId: number,
  dealerId: number,
  variantId?: number | null
): Promise<ProductDealerPriceResponse> {
  const params: Record<string, any> = {
    productId,
    dealerId,
  };

  // ✅ Variant ID varsa ekle
  if (variantId) {
    params.variantId = variantId;
  }

  const res = await api.get<ApiEnvelope<ProductDealerPriceResponse>>(
    `/product-prices/variant/${params.variantId}/dealer/${params.dealerId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Fiyat bilgisi alınamadı");
  }

  return res.data.data;
}