import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CategoryRow } from "../../types/category";
import { normalizeCategoryList } from "./_normalize";

export async function searchCategories(q: string): Promise<CategoryRow[]> {
  const res = await api.get<ApiEnvelope<any> | any>("/categories/search", {
    params: { q, name: q },
  });

  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  const items = Array.isArray(payload) ? payload : payload?.content ?? [];
  return normalizeCategoryList(items);
}
