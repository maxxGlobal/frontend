import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { Dealer } from "../../types/dealer";

export async function listDealers(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<Dealer>> {
  const res = await api.get<ApiEnvelope<PageResponse<Dealer>>>(`/dealers`, {
    params: {
      page: req.page,
      size: req.size,
      sortBy: req.sortBy,
      sortDirection: req.sortDirection,
    },
    signal: opts?.signal,
  });
  return (res as any).data?.data ?? (res as any).data;
}
