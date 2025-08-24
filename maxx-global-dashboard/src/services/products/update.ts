import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductUpdateRequest, Product } from "../../types/product";
import { normalizeProductDetail } from "./_normalize";

export async function updateProduct(
  id: number,
  body: ProductUpdateRequest
): Promise<Product> {
  const res = await api.put<ApiEnvelope<any> | any>(`/products/${id}`, body);
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeProductDetail(payload);
}
