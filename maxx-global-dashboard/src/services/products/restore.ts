import api from "../../lib/api";

export async function restoreProduct(id: number): Promise<void> {
  await api.post(`/products/${id}/restore`);
}
