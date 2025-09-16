// src/lib/api.ts - Enhanced debugging version
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
});

// Notification refresh endpoints
const NOTIFICATION_REFRESH_ENDPOINTS = [
  "/orders", "/notifications", "/users", "/dealers", "/products", "/discounts",
];
const NOTIFICATION_REFRESH_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function getTokenFromStorageOrCookie() {
  const ls = localStorage.getItem("token");
  if (ls) return ls.startsWith("Bearer ") ? ls.slice(7) : ls;

  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Token geçerlilik kontrolü
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (!payload.exp) return false;

    const isExpired = payload.exp < currentTime;
    return isExpired;
  } catch (error) {
    return true;
  }
}

// Güvenli logout fonksiyonu
function performLogout(reason: string = "Unknown", redirectToLogin = true) {
  // Storage'ı temizle
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Cookie temizle
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Event gönder
  const customEvent = new CustomEvent("userLoggedOut", { detail: { reason } });
  window.dispatchEvent(customEvent);
  
  if (redirectToLogin && window.location.pathname !== "/login") {
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorageOrCookie();
    
    if (!token) return config;
    
    if (isTokenExpired(token)) {
      performLogout("Token expired in request interceptor");
      return Promise.reject(new Error("Token expired"));
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Notification refresh logic
    const { config } = response;
    const shouldRefreshNotifications = 
      config.method && 
      NOTIFICATION_REFRESH_METHODS.includes(config.method.toUpperCase()) &&
      NOTIFICATION_REFRESH_ENDPOINTS.some(endpoint => 
        config.url?.includes(endpoint)
      );

    if (shouldRefreshNotifications) {
      scheduleNotificationRefresh();
    }

    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const message = responseData?.message || error?.message;
    const url = error?.config?.url;
    
    // Özel backend mesajları için ekstra kontrol
    const allTexts = [
      message,
      responseData?.error,
      responseData?.message,
      JSON.stringify(responseData)
    ].filter(Boolean).join(' ').toLowerCase();
    
    // 401: Unauthorized
    if (status === 401) {
      performLogout(`401 Unauthorized from ${url}`);
      return Promise.reject(error);
    }
    
    // Herhangi bir status'ta token/JWT problemleri kontrol et
    const tokenKeywords = [
      'token', 'jwt', 'signature', 'expired', 'invalid', 'unauthorized',
      'süreniz dolmuş', 'süresi dolmuş', 'login ol', 'tekrar giriş',
      'oturum', 'session'
    ];
    
    const hasTokenIssue = tokenKeywords.some(keyword => 
      allTexts.includes(keyword)
    );
    
    if (hasTokenIssue && (status === 401 || status === 403 || status === 419)) {
      performLogout(`${status} Token issue: ${message} from ${url}`);
      return Promise.reject(error);
    }
    
    // 419: Session expired
    if (status === 419) {
      performLogout(`419 Session expired from ${url}`);
      return Promise.reject(error);
    }

    // Network hatası - token kontrolü yap
    if (!status && message === "Network Error") {
      const token = getTokenFromStorageOrCookie();
      if (token && isTokenExpired(token)) {
        performLogout("Network error with expired token");
        return Promise.reject(error);
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
    const customEvent = new CustomEvent("refreshNotifications", {
      detail: { source: "api-response" }
    });
    window.dispatchEvent(customEvent);
  }, 1000);
}

export default api;
export { isTokenExpired, performLogout };