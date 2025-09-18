import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { AdminBroadcastRequest } from "../../types/notifications";

export async function adminBroadcast(payload: AdminBroadcastRequest) {
  const res = await api.post<ApiEnvelope<AdminBroadcastRequest>>(
    "/notifications/admin/broadcast",
    payload
  );
  return res;
}
