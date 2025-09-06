// src/services/notifications/my.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { NotificationRow } from "../../types/notifications";

export type MyNotifListReq = {
  page: number;
  size: number;
  q?: string;
  unreadOnly?: boolean;
  type?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
};

export type MyNotifListRes = {
  content: NotificationRow[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
};

// Bazı backendlere göre envelope farkı olabilir — normalize edelim
function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

/** Kullanıcının bildirimleri (sayfalı) */
export async function listMyNotifications(
  req: MyNotifListReq,
  opts?: { signal?: AbortSignal }
): Promise<MyNotifListRes> {
  const { page, size, q, unreadOnly, type, priority } = req;

  const res = await api.get<ApiEnvelope<MyNotifListRes>>(`/notifications`, {
    params: {
      page,
      size,
      q: q?.trim() || undefined,
      unreadOnly:
        typeof unreadOnly === "boolean" ? String(unreadOnly) : undefined,
      type: type || undefined,
      priority: priority || undefined,
    },
    signal: opts?.signal,
  });

  const data = unwrap<MyNotifListRes>(res);
  // İçerik yoksa güvenli boş
  return {
    content: Array.isArray((data as any).content) ? data.content : [],
    pageNumber: (data as any).pageNumber ?? page,
    totalPages: (data as any).totalPages ?? 1,
    totalElements: (data as any).totalElements ?? data.content.length ?? 0,
  };
}

/** Tek bildirimi okundu işaretle */
export async function markMyNotificationRead(
  id: number,
  opts?: { signal?: AbortSignal }
) {
  await api.put(`/notifications/${id}/read`, null, { signal: opts?.signal });
}
