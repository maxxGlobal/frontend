// src/services/categories/listAll.ts
import { listCategories } from "./list";
import type { CategoryRow } from "../../types/category";
import type { PageRequest } from "../../types/paging";

/** Tüm sayfaları gezip bütün kategorileri tek listede döndürür */
export async function listAllCategories(opts?: {
  signal?: AbortSignal;
}): Promise<CategoryRow[]> {
  const out: CategoryRow[] = [];
  const base: Omit<PageRequest, "page" | "size"> = {
    sortBy: "name" as any,
    sortDirection: "asc",
  };

  let page = 0;
  const size = 200; // büyüt, sayfa sayısı azalsın
  let totalPages = 1;

  do {
    const res = await listCategories({ page, size, ...base } as any, {
      signal: opts?.signal,
    });
    out.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  } while (page < totalPages);

  return out;
}
