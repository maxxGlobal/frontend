import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type ProductVariant = {
  id: number;
  productId: number;
  size: string | null;
  sku: string | null;
  stockQuantity: number | null;
  isActive: boolean;
};

/**
 * Belirli bir ürünün tüm varyantlarını getirir
 */
export async function getProductVariants(
  productId: number
): Promise<ProductVariant[]> {
  const res = await api.get<ApiEnvelope<ProductVariant[]>>(
    `/products/${productId}/variants`
  );
  
  if (!res.data.success) {
    throw new Error(res.data.message || "Varyantlar yüklenemedi");
  }
  
  return res.data.data;
}