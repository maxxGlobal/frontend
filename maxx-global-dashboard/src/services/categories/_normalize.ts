// src/services/categories/_normalize.ts
import type { CategoryRow, Category } from "../../types/category";

/** LIST cevabındaki tekil eleman (backend şekli) */
export type ApiCategoryListItem = {
  id: number;
  name: string;
  parentCategoryName?: string | null;
  createdAt?: string | null;
  status?: string | null;
};

/** /categories (page.content) -> CategoryRow[] */
export function normalizeCategoryList(
  items: ApiCategoryListItem[]
): CategoryRow[] {
  return (items ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    parentName: it.parentCategoryName ?? null,
    createdAt: it.createdAt ?? null,
    status: (it.status as any) ?? null,
  }));
}

/** Detay (GET /categories/{id}) backend şekli örnek */
export type ApiCategoryDetail = {
  id: number;
  name: string;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function normalizeCategoryDetail(it: ApiCategoryDetail): Category {
  return {
    id: Number(it?.id),
    name: String(it?.name ?? ""),
    parentId: it?.parentCategoryId ?? null,
    parentCategoryName: it?.parentCategoryName ?? null,
    status: (it?.status as any) ?? null,
    createdAt: it?.createdAt ?? null,
    updatedAt: it?.updatedAt ?? null,
  };
}

/** Select için opsiyon tipi */
export type CategoryOption = { id: number; label: string };

/** Düz listeden (id, name, parentCategoryName) -> ağaç kurup -> opsiyonlara çevir */
export type Flat = { id: number; name: string; parentName: string | null };
export type CategoryTreeNode = {
  id: number;
  name: string;
  children: CategoryTreeNode[];
};

export function buildTreeFromFlat(
  rows: { id: number; name: string; parentName?: string | null }[]
) {
  const byId: Record<number, any> = {};
  const roots: any[] = [];
  const byName = new Map(rows.map((r) => [r.name, r.id]));

  for (const r of rows) {
    byId[r.id] = { id: r.id, name: r.name, children: [] };
  }
  for (const r of rows) {
    const node = byId[r.id];
    const parentId = r.parentName ? byName.get(r.parentName) : undefined;
    if (parentId && byId[parentId]) {
      byId[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function flattenTreeToOptions(
  nodes: { id: number; name: string; children?: any[] }[],
  depth = 0
): CategoryOption[] {
  const out: CategoryOption[] = [];
  for (const n of nodes ?? []) {
    out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
    if (n.children?.length) {
      out.push(...flattenTreeToOptions(n.children, depth + 1));
    }
  }
  return out;
}
export function normalizeCategorySummaries(
  items: any[]
): { id: number; name: string }[] {
  return (items ?? []).map((x: any) => ({
    id: Number(x?.id),
    name: String(x?.name ?? ""),
  }));
}
