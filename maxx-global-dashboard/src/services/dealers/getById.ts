import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";

export async function getDealerById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<Dealer> {
  const res = await api.get<ApiEnvelope<Dealer>>(`/dealers/${id}`, {
    signal: opts?.signal,
  });
  return (res as any).data?.data ?? (res as any).data;
}
