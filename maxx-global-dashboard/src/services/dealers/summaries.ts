// src/services/dealers/summaries.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { DealerSummary } from "../../types/dealer";
import { normalizeDealerSummaries } from "./_normalize";

export async function getDealerSummaries(): Promise<DealerSummary[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>("/dealers/summaries");
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeDealerSummaries(Array.isArray(payload) ? payload : []);
}
