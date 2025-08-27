import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";
import { normalizeProductList } from "./_normalize";

export async function listProductsBySearch(
  q: string,
  req: PageRequest & { isActive?: boolean },
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<ProductRow>> {
  const res = await api.get<ApiEnvelope<any> | any>("/products/search", {
    params: {
      q,
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection,
      isActive: typeof req.isActive === "boolean" ? req.isActive : undefined,
    },
    signal: opts?.signal,
  });

  const raw = (res as any).data?.data ?? (res as any).data;

  if (raw && typeof raw === "object" && Array.isArray(raw.content)) {
    const content = normalizeProductList(raw.content);
    return { ...raw, content } as PageResponse<ProductRow>;
  }

  const arr: any[] = Array.isArray(raw) ? raw : [];
  const content = normalizeProductList(arr);
  return {
    content,
    number: req.page ?? 0,
    size: req.size ?? content.length,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
    numberOfElements: content.length,
  };
}
