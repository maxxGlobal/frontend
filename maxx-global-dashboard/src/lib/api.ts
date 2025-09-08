// src/lib/api.ts - Enhanced version
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
});

// Notification verilerini yenilemesi gereken endpoint'ler
const NOTIFICATION_REFRESH_ENDPOINTS = [
  "/orders",          // Sipariş işlemleri
  "/notifications",   // Bildirim işlemleri
  "/users",          // Kullanıcı işlemleri
  "/dealers",        // Bayi işlemleri
  "/products",       // Ürün işlemleri
  "/discounts",      // İndirim işlemleri
];

// Notification refresh'i tetikleyecek HTTP methodları
const NOTIFICATION_REFRESH_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function getTokenFromStorageOrCookie() {
  const ls = localStorage.getItem("token");
  if (ls) return ls.startsWith("Bearer ") ? ls.slice(7) : ls;

  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

api.interceptors.request.use((config) => {
  const token = getTokenFromStorageOrCookie();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Başarılı response'larda notification refresh kontrolü
    const { config } = response;
    const shouldRefreshNotifications = 
      config.method && 
      NOTIFICATION_REFRESH_METHODS.includes(config.method.toUpperCase()) &&
      NOTIFICATION_REFRESH_ENDPOINTS.some(endpoint => 
        config.url?.includes(endpoint)
      );

    if (shouldRefreshNotifications) {
      // Notification verilerini yenile (debounced)
      scheduleNotificationRefresh();
    }

    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Debounced notification refresh
let refreshTimeout: number | null = null;
function scheduleNotificationRefresh() {
  if (refreshTimeout) window.clearTimeout(refreshTimeout);
  
  refreshTimeout = window.setTimeout(() => {
    // React Query client'ı global olarak erişmek için window'a koyabiliriz
    // veya custom event dispatch edebiliriz
    const customEvent = new CustomEvent("refreshNotifications", {
      detail: { source: "api-response" }
    });
    window.dispatchEvent(customEvent);
  }, 1000); // 1 saniye debounce
}

export default api;