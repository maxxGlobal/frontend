// src/services/categories/delete.ts
import api from "../../lib/api";

export async function deleteCategory(id: number) {
  const res = await api.delete(`/categories/${id}`);
  return (res as any).data ?? null;
}
