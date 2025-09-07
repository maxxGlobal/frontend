import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { TopDealer } from "../../types/dashboard";

export async function listTopDealers(): Promise<TopDealer[]> {
  const res = await api.get<
    ApiEnvelope<{ dealers: TopDealer[] }> | { dealers: TopDealer[] }
  >("/admin/dashboard/charts/top-dealers");
  const payload = (res as any).data?.data ??
    (res as any).data ?? { dealers: [] };
  return payload.dealers ?? [];
}
