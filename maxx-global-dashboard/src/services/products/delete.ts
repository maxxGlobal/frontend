import api from "../../lib/api";

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
