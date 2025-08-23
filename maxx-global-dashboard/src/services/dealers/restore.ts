// src/services/dealers/restore.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";
import { normalizeDealer } from "./_normalize";

export async function restoreDealer(id: number): Promise<Dealer> {
  const res = await api.post<ApiEnvelope<any> | any>(`/dealers/restore/${id}`);
  const data = (res as any).data?.data ?? (res as any).data ?? null;
  return normalizeDealer(data || {});
}
