// src/services/categories/active.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CategoryRow } from "../../types/category";
import { normalizeCategoryList } from "./_normalize";

export async function listActiveCategories(): Promise<CategoryRow[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>("/categories/active");
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeCategoryList(Array.isArray(payload) ? payload : []);
}
