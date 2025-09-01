import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";
import { normalizeDealer } from "./_normalize";

export async function getDealerById(id: number): Promise<Dealer> {
  const res = await api.get<ApiEnvelope<any> | any>(`/dealers/${id}`);
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeDealer(payload);
}
