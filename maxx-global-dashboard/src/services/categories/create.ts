import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Category } from "../../types/category";

/** UI'dan name + parentId geliyor; API'ye parentCategoryId olarak gönderiyoruz */
export async function createCategory(payload: {
  name: string;
  parentId?: number | null;
}): Promise<Category> {
  const body: any = { name: payload.name };
  if (payload.parentId != null) {
    body.parentCategoryId = payload.parentId; // <-- backend beklediği alan
  }

  const res = await api.post<ApiEnvelope<Category> | Category>(
    "/categories",
    body
  );
  const data = (res as any).data?.data ?? (res as any).data;
  return data as Category;
}
