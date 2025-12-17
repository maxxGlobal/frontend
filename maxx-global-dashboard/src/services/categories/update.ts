import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CategoryUpdateRequest, CategoryRow } from "../../types/category";

export async function updateCategory(
  id: number,
  payload: CategoryUpdateRequest
): Promise<CategoryRow> {
  const body: any = {
    name: payload.name,
    nameEn: payload.nameEn,
    description: payload.description ?? null,
    descriptionEn: payload.descriptionEn ?? null,
    status: payload.status,
  };
  if (payload.parentId !== undefined) {
    body.parentCategoryId = payload.parentId;
  }

  const res = await api.put<ApiEnvelope<CategoryRow> | CategoryRow>(
    `/categories/${id}`,
    body
  );
  return (res as any).data?.data ?? (res as any).data;
}
