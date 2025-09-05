import api from "../../lib/api";
import type { ApiEnvelope } from "../common";
import type { NotificationSummary } from "../../types/notifications";

/** Okunmamış bildirim sayısı */
export async function getUnreadCount(opts?: {
  signal?: AbortSignal;
}): Promise<number> {
  const res = await api.get<ApiEnvelope<number>>(
    `/notifications/unread-count`,
    {
      signal: opts?.signal,
    }
  );
  return (res as any).data?.data ?? (res as any).data ?? 0;
}

/** number/string/BigInt -> number (geçersizse 0) */
function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Bildirim özeti (gelen veriyi güvenli sayıya çevirir) */
export async function getNotificationSummary(opts?: {
  signal?: AbortSignal;
}): Promise<NotificationSummary> {
  const res = await api.get<ApiEnvelope<Partial<NotificationSummary>>>(
    `/notifications/summary`,
    {
      signal: opts?.signal,
    }
  );
  const d: any = (res as any).data?.data ?? (res as any).data ?? {};
  return {
    totalCount: toNum(d.totalCount),
    unreadCount: toNum(d.unreadCount),
    readCount: toNum(d.readCount),
    archivedCount: toNum(d.archivedCount),
    todayCount: toNum(d.todayCount),
    thisWeekCount: toNum(d.thisWeekCount),
    highPriorityUnreadCount: toNum(d.highPriorityUnreadCount),
  };
}

/** Hepsini okundu işaretle */
export async function markAllNotificationsRead(opts?: {
  signal?: AbortSignal;
}) {
  await api.put(`/notifications/mark-all-read`, null, {
    signal: opts?.signal,
  });
}
