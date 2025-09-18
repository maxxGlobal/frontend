// src/services/products/popular.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listPopularProducts(
  limit: number = 6,
  daysPeriod: number = 30
): Promise<ProductRow[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>(
    `/products/popular?size=${limit}&daysPeriod=${daysPeriod}&sortBy=orderCount&sortDirection=desc`
  );
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  const content = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : [];
  return normalizeProductList(content);
}