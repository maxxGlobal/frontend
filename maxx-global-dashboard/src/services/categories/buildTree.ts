// src/services/categories/buildTree.ts
import type { CategoryRow } from "../../types/category";

export type CatNode = {
  id: number;
  name: string;
  children: CatNode[];
};

/** düz liste -> ağaç (sonsuz seviye) */
export function buildCategoryTree(rows: CategoryRow[]): CatNode[] {
  const byId = new Map<number, CatNode>();
  const idsByName = new Map<string, number>(); // parentId için name -> id haritası
  const roots: CatNode[] = [];

  // name -> id map (aynı isim iki kez varsa ilkini alır)
  for (const r of rows) {
    if (!idsByName.has(r.name)) idsByName.set(r.name, r.id);
  }

  // node'ları hazırla
  for (const r of rows) {
    byId.set(r.id, { id: r.id, name: r.name, children: [] });
  }

  // bağla
  for (const r of rows) {
    const node = byId.get(r.id)!;
    const parentId = r.parentName ? idsByName.get(r.parentName) ?? null : null;

    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // alfabetik sırala (isteğe bağlı)
  const sortRec = (arr: CatNode[]) => {
    arr.sort((a, b) =>
      a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
    );
    arr.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

/** ağaç -> select options (— ile girinti) */
export function flattenNodesToOptions(
  nodes: CatNode[],
  depth = 0
): { value: number; label: string }[] {
  const out: { value: number; label: string }[] = [];
  const pad = depth > 0 ? "— ".repeat(depth) : "";
  for (const n of nodes) {
    out.push({ value: n.id, label: `${pad}${n.name}` });
    if (n.children?.length)
      out.push(...flattenNodesToOptions(n.children, depth + 1));
  }
  return out;
}
