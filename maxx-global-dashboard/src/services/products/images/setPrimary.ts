import api from "../../../lib/api";
import type { ApiEnvelope } from "../../common";
import { normalizeProductDetail } from "../_normalize";
import type { Product } from "../../../types/product";

export async function setPrimaryImage(
  productId: number,
  imageId: number
): Promise<Product> {
  // API çağrısı
  const res = await api.put<ApiEnvelope<Product>>(
    `/products/${productId}/images/${imageId}/primary`
  );

  // Gelen yanıtı normalize et
  const payload = res.data?.data ?? res.data;
  return normalizeProductDetail(payload);
}
