import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { ApiCategoryTreeItem } from "./_normalize";
import { getSubcategories } from "./subcategories";

/** Sığ ağaç: backend ne verirse */
export async function getCategoryTree(opts?: {
  signal?: AbortSignal;
}): Promise<ApiCategoryTreeItem[]> {
  const res = await api.get<
    ApiEnvelope<ApiCategoryTreeItem[]> | ApiCategoryTreeItem[]
  >("/categories/tree", { signal: opts?.signal });
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return Array.isArray(payload) ? payload : [];
}

/** Derin ağaç: hasChildren=true & children=null olan her düğümü recursive genişletir */
export async function getCategoryTreeDeep(opts?: {
  signal?: AbortSignal;
}): Promise<ApiCategoryTreeItem[]> {
  const root = await getCategoryTree(opts);

  async function expand(
    nodes: ApiCategoryTreeItem[]
  ): Promise<ApiCategoryTreeItem[]> {
    const out: ApiCategoryTreeItem[] = [];
    for (const n of nodes) {
      let children = n.children;

      // çocuklar boş ama hasChildren true => API'den çek
      if (n.hasChildren && (!children || children.length === 0)) {
        try {
          children = await getSubcategories(n.id, opts);
        } catch {
          children = [];
        }
      }

      // altları da genişlet
      if (children && children.length) {
        children = await expand(children);
      }

      out.push({ ...n, children });
    }
    return out;
  }

  return expand(root);
}
