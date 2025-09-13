// src/services/products/bulk.ts
import api from "../../lib/api";
import { normalizeProductList } from "./_normalize";
import type { ProductRow } from "../../types/product";
import type { ApiEnvelope } from "../common";

export async function fetchProductsByIds(
  productIds: number[],
  opts?: { signal?: AbortSignal }
): Promise<ProductRow[]> {
  if (!productIds.length) return [];
  const res = await api.post<ApiEnvelope<any> | any>(
    "/products/bulk",
    { productIds },
    { signal: opts?.signal }
  );
  const raw = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeProductList(Array.isArray(raw) ? raw : []);
}
