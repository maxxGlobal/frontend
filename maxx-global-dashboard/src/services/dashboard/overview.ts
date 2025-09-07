import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { OverviewResponse } from "../../types/dashboard";

export async function getDashboardOverview(): Promise<OverviewResponse> {
  const res = await api.get<ApiEnvelope<OverviewResponse> | OverviewResponse>(
    "/admin/dashboard/overview"
  );
  const payload = (res as any).data?.data ?? (res as any).data;
  return payload as OverviewResponse;
}
