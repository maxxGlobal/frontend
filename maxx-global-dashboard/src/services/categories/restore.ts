import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CategoryRow } from "../../types/category";

/** Silinmiş kategoriyi geri yükler */
export async function restoreCategory(id: number): Promise<CategoryRow> {
  // Swagger’da yol /api/categories/{id}/restore görünüyor
  const res = await api.post<ApiEnvelope<any> | any>(
    `/categories/${id}/restore`
  );
  const raw = (res as any).data?.data ?? (res as any).data ?? {};

  const row: CategoryRow = {
    id: raw.id,
    name: raw.name,
    parentName: raw.parentCategoryName ?? null,
    createdAt: raw.createdAt ?? null,
    status: raw.status ?? null,
  };
  return row;
}
