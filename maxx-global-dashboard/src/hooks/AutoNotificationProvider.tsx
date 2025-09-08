// src/hooks/AutoNotificationProvider.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

/**
 * Tüm sayfalarda otomatik notification yenileme sağlar
 * DashboardLayout içine koyarak hiçbir sayfada değişiklik yapmadan
 * otomatik çalışmasını sağlar
 */
export function AutoNotificationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { refreshLight } = useNotifications();

  // Her sayfa değişiminde notification'ları yenile
  useEffect(() => {
    // Sadece dashboard sayfalarında çalışsın (login sayfasında gereksiz)
    if (location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/users') ||
        location.pathname.startsWith('/orders') ||
        location.pathname.startsWith('/products') ||
        location.pathname.startsWith('/dealers') ||
        location.pathname.startsWith('/discounts') ||
        location.pathname.startsWith('/notifications')) {
      
      // Sayfa yüklendiğinde biraz bekle, sonra yenile
      const timer = setTimeout(() => {
        refreshLight();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, refreshLight]);

  return <>{children}</>;
} 