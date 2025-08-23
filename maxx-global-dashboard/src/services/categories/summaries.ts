import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { CategorySummary } from "../../types/category";
import { normalizeCategorySummaries } from "./_normalize";

/** Kategori özet listesini getirir (id, name) */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>(
    "/categories/summaries"
  );
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeCategorySummaries(Array.isArray(payload) ? payload : []);
}
