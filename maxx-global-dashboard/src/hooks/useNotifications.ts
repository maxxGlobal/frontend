// src/hooks/useNotifications.ts
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const NOTIFICATION_QUERY_KEYS = {
  unread: ["notifications", "unreadCount"],
  summary: ["notifications", "summary"],
  latest: ["notifications", "latest"],
  my: ["myNotifications"],
} as const;

/**
 * Notification verilerini yönetmek için hook
 * Sayfa değişimlerinde ve kullanıcı etkileşimlerinde notification cache'ini yeniler
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  /**
   * Tüm notification verilerini yenile
   * Sayfa değişimlerinde otomatik çağrılır
   */
  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unread });
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.summary });
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.latest });
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.my });
  }, [queryClient]);

  /**
   * Sadece okunmamış sayı ve son bildirimları yenile
   * Hafif yenileme için kullanılır
   */
  const refreshLight = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unread });
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.latest });
  }, [queryClient]);

  /**
   * Belirli notification query'lerini yenile
   */
  const refreshSpecific = useCallback(
    (keys: (keyof typeof NOTIFICATION_QUERY_KEYS)[]) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS[key] });
      });
    },
    [queryClient]
  );

  /**
   * Notification sayısını manuel güncelle (optimistic update)
   */
  const updateUnreadCount = useCallback(
    (count: number) => {
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unread, count);
    },
    [queryClient]
  );

  return {
    refreshAll,
    refreshLight,
    refreshSpecific,
    updateUnreadCount,
    queryKeys: NOTIFICATION_QUERY_KEYS,
  };
}