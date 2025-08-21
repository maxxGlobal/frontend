import api from "../../lib/api";
import { normalizeToPage, type ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { Dealer } from "../../types/dealer";

/** Bazı backendlere göre dizi veya PageResponse dönebilir -> normalize ediyoruz */
export async function listActiveDealers(
  req: PageRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<Dealer>> {
  const res = await api.get<ApiEnvelope<PageResponse<Dealer> | Dealer[]>>(
    `/dealers/active`,
    {
      params: {
        page: req.page,
        size: req.size,
        sortBy: req.sortBy,
        sortDirection: req.sortDirection,
      },
      signal: opts?.signal,
    }
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return normalizeToPage<Dealer>(payload, req);
}
