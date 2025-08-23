import api from "../../lib/api";
import type { ApiEnvelope } from "../common";

export type CategoryDetail = {
  id: number;
  name: string;
  status?: string | null;
  parentId?: number | null; // <- normalize edilmiş alan
  parentCategoryId?: number | null; // backend böyle de dönebilir
  parentCategoryName?: string | null;
};

function normalizeDetail(raw: any): CategoryDetail {
  return {
    id: Number(raw?.id),
    name: String(raw?.name ?? ""),
    status: raw?.status ?? null,
    parentId: raw?.parentId ?? raw?.parentCategoryId ?? null,
    parentCategoryId: raw?.parentCategoryId ?? null,
    parentCategoryName: raw?.parentCategoryName ?? null,
  };
}

export async function getCategoryById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<CategoryDetail> {
  const res = await api.get<ApiEnvelope<any> | any>(`/categories/${id}`, {
    signal: opts?.signal,
  });
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeDetail(payload);
}
