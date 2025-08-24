import api from "../../../lib/api";
import type { ApiEnvelope } from "../../common";
import { normalizeProductDetail } from "../_normalize";
import type { Product } from "../../../types/product";

export async function setPrimaryImage(
  productId: number,
  imageId: number
): Promise<Product> {
  const res = await api.put<ApiEnvelope<any> | any>(
    `/products/${productId}/images/${imageId}/primary`
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeProductDetail(payload);
}
