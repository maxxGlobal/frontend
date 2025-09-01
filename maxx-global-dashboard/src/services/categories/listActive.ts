// src/services/categories/listActive.ts
import api from "../../lib/api";
import type { CategoryRow } from "../../types/category";

export async function listActiveCategories(opts?: {
  signal?: AbortSignal;
}): Promise<(CategoryRow & { label: string })[]> {
  const out: CategoryRow[] = [];

  let page = 0;
  const size = 200;
  let totalPages = 1;

  do {
    const res = await api.get("/categories/active", {
      params: { page, size, sortBy: "name", sortDirection: "asc" },
      signal: opts?.signal,
    });

    // Backend PageResponse döndürüyor: { content, totalPages, ... }
    out.push(...res.data.content);
    totalPages = res.data.totalPages;
    page += 1;
  } while (page < totalPages);

  // parent-child ilişkisini kur
  const byParent: Record<number, CategoryRow[]> = {};
  out.forEach((c) => {
    const pid = (c as any).parentId ?? 0;
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push(c);
  });

  const flattened: (CategoryRow & { label: string })[] = [];

  function walk(nodes: CategoryRow[], depth: number) {
    nodes.forEach((n) => {
      const indent = "  ".repeat(depth);
      const arrow = depth > 0 ? "-- " : "";
      flattened.push({
        ...n,
        label: `${indent}${arrow}${n.name}`,
      });

      const children = byParent[n.id];
      if (children) walk(children, depth + 1);
    });
  }

  if (byParent[0]) {
    walk(byParent[0], 0);
  }

  return flattened;
}
