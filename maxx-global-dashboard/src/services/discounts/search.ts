// src/services/discounts/search.ts
import api from "../../lib/api";
import type { Discount, PageResponse } from "../../types/discount";

/** GET /discounts/search?q=...&page=...&size=...&sortBy=...&sortDirection=... */
export async function searchDiscounts(
  q: string,
  page = 0,
  size = 30,
  sortBy = "name",
  sortDirection: "asc" | "desc" = "asc"
): Promise<PageResponse<Discount>> {
  const res = await api.get("/discounts/search", {
    params: { q, page, size, sortBy, sortDirection },
  });

  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? {};
  const content: Discount[] = Array.isArray(raw.content) ? raw.content : [];

  return {
    content,
    totalElements: Number.isFinite(raw.totalElements)
      ? raw.totalElements
      : content.length,
    totalPages: Number.isFinite(raw.totalPages) ? raw.totalPages : 1,
    size: Number.isFinite(raw.size) ? raw.size : size,
    number: Number.isFinite(raw.number) ? raw.number : page,
    numberOfElements: Number.isFinite(raw.numberOfElements)
      ? raw.numberOfElements
      : content.length,
    first: typeof raw.first === "boolean" ? raw.first : page === 0,
    last:
      typeof raw.last === "boolean"
        ? raw.last
        : raw.totalPages
        ? page + 1 >= raw.totalPages
        : true,
    empty: typeof raw.empty === "boolean" ? raw.empty : content.length === 0,
  };
}
