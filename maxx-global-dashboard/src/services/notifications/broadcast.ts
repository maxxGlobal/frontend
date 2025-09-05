import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { AdminBroadcastRequest } from "../../types/notifications";

export async function adminBroadcast(payload: AdminBroadcastRequest) {
  console.log("payload", payload);
  const res = await api.post<ApiEnvelope<AdminBroadcastRequest>>(
    "/notifications/admin/broadcast",
    payload
  );
  console.log("res", res);
  console.log("res.data", res.data.data);
  return res;
}
