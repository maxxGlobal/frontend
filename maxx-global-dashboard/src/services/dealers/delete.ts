import api from "../../lib/api";

export async function deleteDealer(id: number): Promise<void> {
  await api.delete(`/dealers/${id}`);
}
