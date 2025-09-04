// src/services/discounts/list.ts
import api from "../../lib/api";
import type { Discount, PageResponse } from "../../types/discount";

/**
 * Backend bazen { success, data: { ...page... } } şeklinde döner.
 * Bu servis hem wrapper'lı hem de direkt page dönen cevapları güvenli şekilde unwrap eder.
 */
export async function listDiscounts(
  page = 0,
  size = 30
): Promise<PageResponse<Discount>> {
  const res = await api.get("/discounts", { params: { page, size } });

  // wrapper'lı/düz cevap ayrımı (önce data.data, yoksa data)
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? {};

  // İçerik ve sayfalama alanlarını defansif biçimde topla
  const content: Discount[] = Array.isArray(raw.content) ? raw.content : [];

  const pageData: PageResponse<Discount> = {
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

  return pageData;
}
