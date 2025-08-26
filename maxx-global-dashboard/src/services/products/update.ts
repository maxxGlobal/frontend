import api from "../../lib/api";
import type { ProductUpdateRequest, Product } from "../../types/product";
import { normalizeProductDetail } from "./_normalize";

/**
 * BE put /products/:id -> sadece alanları döndürüyor (id, categoryName yok).
 * Burada id'yi enjekte ediyoruz.
 */
export async function updateProduct(
  id: number,
  body: ProductUpdateRequest
): Promise<Product> {
  const res = await api.put<any>(`/products/${id}`, body);
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? {};
  // normalize çağrısına id’yi ekleyerek ver.
  const normalized = normalizeProductDetail({ id, ...raw });
  return normalized;
}
