// src/services/products/listByCategory.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listProductsByCategory(
  categoryId: number,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<ProductRow>> {
  const res = await api.get<ApiEnvelope<any> | any>(
    `/products/category/${categoryId}`,
    {
      signal: opts?.signal,
    }
  );

  // API’den dönen payload’ı normalize ediyoruz
  const payload = (res as any).data?.data ?? (res as any).data;
  const content = normalizeProductList(payload?.content ?? []);
  return { ...payload, content } as PageResponse<ProductRow>;
}
