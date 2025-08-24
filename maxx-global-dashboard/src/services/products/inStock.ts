import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listInStockProducts(): Promise<ProductRow[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>("/products/in-stock");
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeProductList(Array.isArray(payload) ? payload : []);
}
