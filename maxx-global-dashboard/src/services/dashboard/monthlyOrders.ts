import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { MonthlyOrder } from "../../types/dashboard";

export async function listMonthlyOrders(months = 12): Promise<MonthlyOrder[]> {
  const res = await api.get<
    | ApiEnvelope<{ monthlyData: MonthlyOrder[] }>
    | { monthlyData: MonthlyOrder[] }
  >(`/admin/dashboard/charts/monthly-orders?months=${months}`);
  const payload = (res as any).data?.data ??
    (res as any).data ?? { monthlyData: [] };
  return payload.monthlyData ?? [];
}
