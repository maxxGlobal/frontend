// src/services/categories/options.ts
import { listCategories } from "./list";
import type { CategoryOption } from "./_normalize";
import { buildTreeFromFlat, flattenTreeToOptions } from "./_normalize";
import type { PageResponse } from "../../types/paging";

export async function getAllCategoryOptions(opts?: {
  signal?: AbortSignal;
}): Promise<CategoryOption[]> {
  let page = 0;
  const size = 100;
  const flat: { id: number; name: string; parentName: string | null }[] = [];

  while (true) {
    const resp: PageResponse<any> = await listCategories(
      { page, size, sortBy: "name", sortDirection: "asc" },
      { signal: opts?.signal }
    );
    for (const it of resp.content) {
      flat.push({
        id: it.id,
        name: it.name,
        parentName: it.parentName ?? null,
      });
    }
    if (resp.last) break;
    page += 1;
  }

  const tree = buildTreeFromFlat(flat);
  const options = flattenTreeToOptions(tree);
  return options;
}
