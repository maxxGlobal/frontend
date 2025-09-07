import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { RecentActivity } from "../../types/dashboard";

export async function listRecentActivities(): Promise<RecentActivity[]> {
  const res = await api.get<
    | ApiEnvelope<{ activities: RecentActivity[] }>
    | { activities: RecentActivity[] }
  >("/admin/dashboard/recent-activities");
  const payload = (res as any).data?.data ??
    (res as any).data ?? { activities: [] };
  return payload.activities ?? [];
}
