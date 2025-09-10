// src/services/products/random.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listRandomProducts(
  limit: number = 6
): Promise<ProductRow[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>(
    `/products/random?limit=${limit}`
  );
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeProductList(Array.isArray(payload) ? payload : []);
}
