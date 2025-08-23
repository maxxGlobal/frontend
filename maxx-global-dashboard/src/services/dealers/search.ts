// src/services/dealers/search.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { DealerRow } from "../../types/dealer";
import { normalizeDealers } from "./_normalize";

export async function searchDealers(q: string): Promise<DealerRow[]> {
  const res = await api.get<ApiEnvelope<any> | any>("/dealers/search", {
    params: { q },
  });

  // data ya dizi gelir ya da { content: [...] } şeklinde sayfalı yapı
  const raw = (res as any).data?.data ?? (res as any).data ?? [];
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.content)
    ? raw.content
    : [];

  return normalizeDealers(list);
}
