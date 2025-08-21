import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { Dealer } from "../../types/dealer";

export async function searchDealers(
  req: PageRequest & { q: string },
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<Dealer>> {
  const { q, page, size, sortBy, sortDirection } = req;
  const res = await api.get<ApiEnvelope<PageResponse<Dealer>>>(
    `/dealers/search`,
    {
      params: { q: q.trim(), page, size, sortBy, sortDirection },
      signal: opts?.signal,
    }
  );
  return (res as any).data?.data ?? (res as any).data;
}
