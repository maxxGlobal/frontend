import type { PageRequest, PageResponse } from "../types/paging";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string | null;
  code?: number;
  timestamp?: string;
}

/** Diziyi PageResponse'a çevirir */
export function toPage<T>(rows: T[], req: PageRequest): PageResponse<T> {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / req.size));
  const from = req.page * req.size;
  const content = rows.slice(from, from + req.size);
  return {
    content,
    totalElements,
    totalPages,
    number: req.page,
    size: req.size,
    first: req.page === 0,
    last: req.page >= totalPages - 1,
  };
}

/** Backend bazen dizi, bazen PageResponse döndürür -> her durumda PageResponse üret */
export function normalizeToPage<T>(
  payload: any,
  req: PageRequest
): PageResponse<T> {
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.content)
  ) {
    return payload as PageResponse<T>;
  }
  if (Array.isArray(payload)) return toPage<T>(payload, req);
  return toPage<T>([], req);
}
