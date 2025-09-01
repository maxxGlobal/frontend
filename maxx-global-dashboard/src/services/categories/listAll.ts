import { listCategories } from "./list";
import type { CategoryRow } from "../../types/category";
import type { PageRequest } from "../../types/paging";

export async function listAllCategories(opts?: {
  signal?: AbortSignal;
}): Promise<(CategoryRow & { label: string })[]> {
  const out: CategoryRow[] = [];
  const base: Omit<PageRequest, "page" | "size"> = {
    sortBy: "name" as any,
    sortDirection: "asc",
  };

  let page = 0;
  const size = 200;
  let totalPages = 1;

  do {
    const res = await listCategories({ page, size, ...base } as any, {
      signal: opts?.signal,
    });

    // 🔹 sadece aktif olanları topla
    const activeOnly = res.content.filter(
      (c) => (c as any).status === "AKTİF" || (c as any).isActive === true
    );
    out.push(...activeOnly);

    totalPages = res.totalPages;
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
