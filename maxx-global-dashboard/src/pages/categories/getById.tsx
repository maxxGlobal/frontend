import api from "../../lib/api";
import type { CategoryByIdResponse, CategoryDTO } from "../../types/category";

// UI’da kullanmak için sade tip (DTO ile aynı alanlar, isimler korunuyor)
export interface CategoryDetail extends CategoryDTO {}

// Tek sorumlu bir normalizer
function norm(raw: any): CategoryDetail {
  return {
    id: Number(raw?.id),
    name: String(raw?.name ?? ""),
    parentCategoryName: raw?.parentCategoryName ?? null,
    createdAt: raw?.createdAt ?? null,
    status: raw?.status ?? null,
  };
}

export async function getCategoryById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<CategoryDetail> {
  const res = await api.get<CategoryByIdResponse>(`/categories/${id}`, {
    signal: opts?.signal,
  });
  // Bazı backendlerde Axios kapsülü olmayabiliyor; iki olasılığı da karşılayalım:
  const payload =
    (res as any).data?.data ?? (res as any).data?.data ?? (res as any).data;
  return norm(payload);
}
