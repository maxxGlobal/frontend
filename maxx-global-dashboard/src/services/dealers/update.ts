import api from "../../lib/api";
import type { Dealer, DealerUpdateRequest } from "../../types/dealer";

export async function updateDealer(
  id: number,
  payload: DealerUpdateRequest
): Promise<Dealer> {
  const { data } = await api.put<Dealer>(`/dealers/${id}`, payload);
  return data;
}
