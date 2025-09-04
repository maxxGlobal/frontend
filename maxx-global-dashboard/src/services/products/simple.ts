import api from "../../lib/api";
import type { ProductSimple } from "../../types/product";

/** GET /products/simple  -> wrapper { success, data: ProductSimple[] } */
export async function listSimpleProducts(): Promise<ProductSimple[]> {
  const res = await api.get("/products/simple");
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as ProductSimple[]) : [];
}
