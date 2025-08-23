// src/services/dealers/searchByName.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { DealerRow } from "../../types/dealer";
import { normalizeDealers } from "./_normalize";

export async function searchDealersByName(name: string): Promise<DealerRow[]> {
  const res = await api.get<ApiEnvelope<any[]> | any[]>(
    "/dealers/search-by-name",
    { params: { name } }
  );
  const payload = (res as any).data?.data ?? (res as any).data ?? [];
  return normalizeDealers(Array.isArray(payload) ? payload : []);
}
