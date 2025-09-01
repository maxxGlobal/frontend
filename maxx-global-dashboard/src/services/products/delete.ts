import api from "../../lib/api";

export async function deleteProduct(id: number) {
  const res = await api.delete(`/products/${id}`);
  return (res as any).data ?? null;
}
