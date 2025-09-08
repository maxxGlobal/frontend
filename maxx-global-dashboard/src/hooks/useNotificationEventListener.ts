// src/hooks/useNotificationEventListener.ts
import { useEffect } from "react";
import { useNotifications } from "./useNotifications";

/**
 * Global notification refresh event'lerini dinler
 * API response'larından gelen otomatik refresh isteklerini yakalar
 */
export function useNotificationEventListener() {
  const { refreshLight } = useNotifications();

  useEffect(() => {
    const handleRefreshEvent = (event: CustomEvent) => {
      const { source } = event.detail || {};
      
      // API response'larından gelen refresh istekleri için hafif yenileme
      if (source === "api-response") {
        refreshLight();
      }
    };

    window.addEventListener("refreshNotifications", handleRefreshEvent as EventListener);

    return () => {
      window.removeEventListener("refreshNotifications", handleRefreshEvent as EventListener);
    };
  }, [refreshLight]);
} 