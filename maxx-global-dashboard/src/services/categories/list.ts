import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { CategoryRow } from "../../types/category";
import { normalizeCategoryList } from "./_normalize";

export async function listCategories(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<CategoryRow>> {
  const res = await api.get<ApiEnvelope<any> | any>("/categories", {
    params: {
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection,
    },
    signal: opts?.signal,
  });

  const payload = (res as any).data?.data ?? (res as any).data;
  const content = normalizeCategoryList(payload?.content ?? []);
  return { ...payload, content } as PageResponse<CategoryRow>;
}
