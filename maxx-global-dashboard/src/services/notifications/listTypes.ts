import api from "../../lib/api";
import type { ApiEnvelope } from "../common"; // projendeki mevcut ortak tip
import type { NotificationType } from "../../types/notifications";

export async function listNotificationTypes(): Promise<NotificationType[]> {
  const res = await api.get<ApiEnvelope<NotificationType[]>>(
    "/notifications/types"
  );
  return res.data.data;
}
