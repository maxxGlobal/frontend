import api from "../../lib/api";
import type { DashboardRefreshMessage } from "../../types/dashboard";

export async function refreshDashboard(): Promise<DashboardRefreshMessage> {
  // text/plain döndüğü için responseType: "text" önemli
  const res = await api.post<string>("/admin/dashboard/refresh", null, {
    responseType: "text",
  });
  return typeof res.data === "string" ? res.data : String(res.data);
}
