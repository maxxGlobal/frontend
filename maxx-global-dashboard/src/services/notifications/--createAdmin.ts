// src/services/notifications/createAdmin.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type {
  CreateAdminNotificationRequest,
  NotificationItem,
} from "../../types/notifications";

export async function createAdminNotification(
  payload: CreateAdminNotificationRequest
) {
  const res = await api.post<ApiEnvelope<NotificationItem[]>>(
    `/notifications/admin/create`,
    payload
  );
  return res.data.data;
}
