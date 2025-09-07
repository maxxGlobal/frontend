import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { RevenueTrend } from "../../types/dashboard";

export async function listRevenueTrend(months = 12): Promise<RevenueTrend[]> {
  const res = await api.get<
    | ApiEnvelope<{ monthlyRevenue: RevenueTrend[] }>
    | { monthlyRevenue: RevenueTrend[] }
  >(`/admin/dashboard/charts/revenue-trend?months=${months}`);
  const payload = (res as any).data?.data ??
    (res as any).data ?? { monthlyRevenue: [] };
  return payload.monthlyRevenue ?? [];
}
