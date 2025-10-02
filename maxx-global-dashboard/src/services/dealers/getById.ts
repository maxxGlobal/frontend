import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";

export async function getDealerById(id: number): Promise<Dealer> {
  const res = await api.get<ApiEnvelope<Dealer> | Dealer>(`/dealers/${id}`);
  return (res as any).data?.data ?? (res as any).data;
}
