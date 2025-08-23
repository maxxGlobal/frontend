import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ApiCategoryTreeItem } from "./_normalize";

/** Belirli kategorinin doğrudan altlarını getirir */
export async function getSubcategories(
  parentId: number,
  opts?: { signal?: AbortSignal }
): Promise<ApiCategoryTreeItem[]> {
  const res = await api.get<
    ApiEnvelope<ApiCategoryTreeItem[]> | ApiCategoryTreeItem[]
  >(`/categories/subcategories/${parentId}`, { signal: opts?.signal });
  const payload = (res as any).data?.data ?? (res as any).data ?? [];

  return Array.isArray(payload) ? payload : [];
}
