import api from "../../lib/api";

export async function restoreDealer(id: number): Promise<void> {
  await api.post(`/dealers/restore/${id}`);
}
