import type { CatNode } from "../../services/categories/buildTree";

export function flattenTreeToOptions(
  nodes: CatNode[],
  depth = 0
): { id: number; label: string; name: string }[] {
  const out: { id: number; label: string; name: string }[] = [];

  nodes.forEach((n) => {
    // her derinlik için 2 boşluk
    const indent = "  ".repeat(depth); // \u00A0 non-breaking space
    const arrow = depth > 0 ? "↳ " : "";

    out.push({
      id: n.id,
      name: n.name,
      label: `${indent}${arrow}${n.name}`,
    });

    if (n.children && n.children.length > 0) {
      out.push(...flattenTreeToOptions(n.children, depth + 1));
    }
  });

  return out;
}
