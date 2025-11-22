import api from "../../lib/api";
import { type ApiEnvelope } from "../common";
import {
  type NotificationsListRequest,
  type NotificationsListResponse,
} from "../../types/notifications";

export async function listSentNotifications(
  req: NotificationsListRequest,
  opts?: { signal?: AbortSignal }
): Promise<NotificationsListResponse> {
  const params: any = {
    page: req.page ?? 0,
    size: req.size ?? 20,
  };
  if (req.q) params.q = req.q.trim();
  if (req.type) params.type = req.type;

  const res = await api.get<ApiEnvelope<NotificationsListResponse>>(
    "/notifications/admin/sent-notifications",
    { params, signal: opts?.signal }
  );

  const payload = (res as any).data?.data ?? (res as any).data ?? (res as any);

  if (Array.isArray(payload)) {
    return {
      content: payload,
      totalElements: payload.length,
      totalPages: 1,
      size: payload.length,
      number: 0,
    };
  }

  return payload as NotificationsListResponse;
}

export async function listNotifications(opts?: {
  signal?: AbortSignal;
}): Promise<NotificationsListResponse> {
  const res = await api.get<{ data: NotificationsListResponse }>(
    "/notifications",
    {
      signal: opts?.signal,
    }
  );
  return res.data.data;
}

export async function deleteSentNotification(
  id: number,
  opts?: { signal?: AbortSignal }
) {
  await api.delete(`/notifications/admin/sent-notifications/${id}`, {
    signal: opts?.signal,
  });
}
