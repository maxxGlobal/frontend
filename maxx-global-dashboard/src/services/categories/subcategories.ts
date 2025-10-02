import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ApiCategoryListItem } from "./_normalize";

/** Belirli kategorinin doğrudan altlarını getirir */
export async function getSubcategories(
  parentId: number,
  opts?: { signal?: AbortSignal }
): Promise<ApiCategoryListItem[]> {
  const res = await api.get<
    ApiEnvelope<ApiCategoryListItem[]> | ApiCategoryListItem[]
  >(`/categories/subcategories/${parentId}`, { signal: opts?.signal });
  const payload = (res as any).data?.data ?? (res as any).data ?? [];

  return Array.isArray(payload) ? payload : [];
}
