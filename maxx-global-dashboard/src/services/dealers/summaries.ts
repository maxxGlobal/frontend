import api from "../../lib/api";
import type { DealerSummary } from "../../types/dealer";
import { normalizeSummary } from "./_normalize";

export async function getDealerSummaries(): Promise<DealerSummary[]> {
  const { data } = await api.get("/dealers/summaries");
  const raw = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
  return normalizeSummary(raw);
}
