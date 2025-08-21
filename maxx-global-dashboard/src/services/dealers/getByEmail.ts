import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { Dealer } from "../../types/dealer";

export async function getDealerByEmail(
  email: string,
  opts?: { signal?: AbortSignal }
): Promise<Dealer | null> {
  const res = await api.get<ApiEnvelope<Dealer | null>>(`/dealers/by-email`, {
    params: { email },
    signal: opts?.signal,
  });
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload ?? null;
}
