// src/services/categories/toTreeData.ts
import type { CatNode } from "../../services/categories/buildTree";

export type TreeNode = {
  title: string; // görünen metin
  value: number; // seçilen değer (categoryId)
  key: string; // benzersiz anahtar
  selectable?: boolean;
  children?: TreeNode[];
};

export function catsToTreeData(
  nodes: CatNode[],
  onlyLeafSelectable = false
): TreeNode[] {
  return (nodes ?? []).map((n) => {
    const hasChildren = Array.isArray(n.children) && n.children.length > 0;
    return {
      title: n.name,
      value: n.id,
      key: String(n.id),
      selectable: onlyLeafSelectable ? !hasChildren : true, // sadece yaprak seçilsin istiyorsan true yap
      children: hasChildren
        ? catsToTreeData(n.children!, onlyLeafSelectable)
        : undefined,
    };
  });
}
