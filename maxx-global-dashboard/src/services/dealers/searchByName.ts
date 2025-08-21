import api from "../../lib/api";
import type { Dealer } from "../../types/dealer";
import type { ApiEnvelope } from "../common";

/** backend'e göre Page veya dizi olabilir; çoğu kurulumda page yoksa dizi döner */
export async function searchDealersByName(
  name: string,
  opts?: { signal?: AbortSignal }
): Promise<Dealer[]> {
  const res = await api.get<ApiEnvelope<Dealer[] | { content: Dealer[] }>>(
    `/dealers/search-by-name`,
    {
      params: { name },
      signal: opts?.signal,
    }
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return Array.isArray(payload) ? payload : payload?.content ?? [];
}
