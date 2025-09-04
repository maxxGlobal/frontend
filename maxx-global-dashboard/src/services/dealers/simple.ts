import api from "../../lib/api";
import type { DealerSummary } from "../../types/dealer";

export async function listSimpleDealers(): Promise<DealerSummary[]> {
  const res = await api.get("/dealers/simple");
  const raw = (res as any)?.data?.data ?? (res as any)?.data ?? [];
  return Array.isArray(raw) ? (raw as DealerSummary[]) : [];
}
