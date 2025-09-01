// src/services/dealerService.ts
import api from "../lib/api";

export interface DealerSummary {
  id: number;
  name: string;
}
function normalize(list: any[]): DealerSummary[] {
  return list.map((d: any) => ({
    id: d.id ?? d.dealerId ?? d.dealerID,
    name: d.name ?? d.dealerName ?? d.title ?? String(d.id ?? d.dealerId),
  }));
}

export async function getDealerSummaries(): Promise<DealerSummary[]> {
  const { data } = await api.get("/dealers/summaries");
  const raw = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
  return normalize(raw);
}
