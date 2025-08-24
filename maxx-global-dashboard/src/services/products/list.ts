import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listProducts(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<ProductRow>> {
  const res = await api.get<ApiEnvelope<any> | any>("/products", {
    params: {
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection, // "asc" | "desc"
    },
    signal: opts?.signal,
  });

  const payload = (res as any).data?.data ?? (res as any).data;
  const content = normalizeProductList(payload?.content ?? []);
  return { ...payload, content } as PageResponse<ProductRow>;
}
