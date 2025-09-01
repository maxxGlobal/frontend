import api from "../../lib/api";
import type { ProductUpdateRequest, Product } from "../../types/product";
import { normalizeProductDetail } from "./_normalize";

export async function updateProduct(
  id: number,
  body: ProductUpdateRequest
): Promise<Product> {
  const res = await api.put<any>(`/products/${id}`, body);
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? {};
  const normalized = normalizeProductDetail({ id, ...raw });
  return normalized;
}
