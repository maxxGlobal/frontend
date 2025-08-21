import api from "../../lib/api";
import type { Dealer, DealerCreateRequest } from "../../types/dealer";

export async function createDealer(
  payload: DealerCreateRequest
): Promise<Dealer> {
  const { data } = await api.post<Dealer>("/dealers", payload);
  return data;
}
