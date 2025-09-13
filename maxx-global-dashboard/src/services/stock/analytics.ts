import api from "../../lib/api";
import type { DailySummaryResponse, TopMovementProduct } from "../../types/stock";
import type { ApiEnvelope } from "../common";

export async function getDailySummary(
  reportDate?: string
): Promise<DailySummaryResponse> {
  const res = await api.get<ApiEnvelope<DailySummaryResponse>>(
    "/stock/analytics/daily-summary",
    {
      params: reportDate ? { reportDate } : undefined
    }
  );
  return res.data.data;
}

export async function getTopMovements(
  startDate?: string,
  endDate?: string,
  limit = 10
): Promise<TopMovementProduct[]> {
  const res = await api.get<ApiEnvelope<TopMovementProduct[]>>(
    "/stock/analytics/top-movements",
    {
      params: { startDate, endDate, limit }
    }
  );
  return res.data.data;
}