import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { StatisticsResponse } from "../../types/dashboard";

export async function getDashboardStatistics(): Promise<StatisticsResponse> {
  const res = await api.get<
    ApiEnvelope<StatisticsResponse> | StatisticsResponse
  >("/admin/dashboard/statistics");
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as StatisticsResponse;
}
