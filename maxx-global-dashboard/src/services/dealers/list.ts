import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { PageRequest, PageResponse } from "../../types/paging";
import type { DealerRow } from "../../types/dealer";

export type DealerListRequest = PageRequest & {
  /** UI’daki arama kutusu */
  q?: string;
  /** Backend status filtresi (ACTIVE | PASSIVE | DELETED) */
  status?: "ACTIVE" | "PASSIVE" | "DELETED";
  /** UI kolaylığı: true ise status=ACTIVE olarak gönderilir */
  activeOnly?: boolean;
};

export async function listDealers(
  req: DealerListRequest,
  opts?: { signal?: AbortSignal }
): Promise<PageResponse<DealerRow>> {
  const { page, size, sortBy, sortDirection } = req;

  const params: Record<string, any> = {
    page,
    size,
    sortBy,
    sortDirection, // "asc" | "desc" olmalı
  };

  // Arama: backend “q” ya da “name” bekliyorsa her ikisini de gönder
  if (req.q) {
    params.q = req.q;
    params.name = req.q;
  }

  // Durum: activeOnly true ise status=ACTIVE gönder
  const statusParam = req.status ?? (req.activeOnly ? "ACTIVE" : undefined);
  if (statusParam) params.status = statusParam;

  const res = await api.get<
    ApiEnvelope<PageResponse<DealerRow>> | PageResponse<DealerRow>
  >("/dealers", { params, signal: opts?.signal });

  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as PageResponse<DealerRow>;
}
