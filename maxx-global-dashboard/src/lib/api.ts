// src/lib/api.ts - Simplified version without refresh token
import axios from "axios";
import { getToken } from "../services/auth/authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true, // Cookie'leri otomatik gönder
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye timeout
});

// Notification refresh endpoints
const NOTIFICATION_REFRESH_ENDPOINTS = [
  "/orders", "/notifications", "/users", "/dealers", "/products", "/discounts",
];
const NOTIFICATION_REFRESH_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// Cookie'den token al
function getTokenFromCookie(): string | null {
  const token = getToken();
  if (!token) return null;
  
  // Bearer prefix'ini temizle
  return token.startsWith('Bearer ') ? token.slice(7) : token;
}

// Token geçerlilik kontrolü
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const parts = cleanToken.split('.');
    
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (!payload.exp) return false;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
}

// Güvenli logout fonksiyonu
export function performLogout(reason: string = "Unknown", redirectToLogin = true) {
  console.log(`Performing logout: ${reason}`);
  
  // Tüm storage'ları temizle
  document.cookie = "token=; Max-Age=0; Path=/; SameSite=strict";
  sessionStorage.clear();
  localStorage.clear();
  
  // Logout event'i gönder
  const customEvent = new CustomEvent("userLoggedOut", { detail: { reason } });
  window.dispatchEvent(customEvent);
  
  if (redirectToLogin && window.location.pathname !== "/login") {
    // Mevcut path'i state'e kaydet
    const currentPath = window.location.pathname + window.location.search;
    setTimeout(() => {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }, 100);
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    
    // Public endpoints listesi
    const publicEndpoints = [
      '/auth/login', 
      '/auth/register', 
      '/auth/forgot-password',
      '/health',
      '/public'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!token && !isPublicEndpoint) {
      console.warn('No token found for protected endpoint:', config.url);
      // Token yoksa ve public endpoint değilse, isteği iptal et
      return Promise.reject(new Error('No authentication token'));
    }
    
    if (token) {
      // Token expired kontrolü
      if (isTokenExpired(token)) {
        console.warn('Token expired, logging out');
        performLogout("Token expired");
        return Promise.reject(new Error("Token expired"));
      }
      
      // Token'ı header'a ekle
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Request ID ekle (debugging için)
    if (crypto.randomUUID) {
      config.headers['X-Request-ID'] = crypto.randomUUID();
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Basitleştirilmiş
api.interceptors.response.use(
  (response) => {
    // Başarılı response - notification refresh kontrolü
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
    const message = responseData?.message || responseData?.error || error?.message;
    const url = error?.config?.url;
    
    // 401: Unauthorized - Direkt logout (refresh token yok)
    if (status === 401) {
      console.warn(`401 Unauthorized from ${url}`);
      
      // Login endpoint'i hariç tut
      if (!url?.includes('/auth/login')) {
        performLogout('Session expired - Please login again');
      }
      return Promise.reject(error);
    }
    
    // 403: Forbidden - Yetki hatası
    if (status === 403) {
      console.warn(`403 Forbidden from ${url}`);
      
      // Token/JWT ile ilgili mesaj kontrolü
      const tokenKeywords = ['token', 'jwt', 'expired', 'invalid', 'süreniz dolmuş'];
      const messageText = (message || '').toLowerCase();
      
      if (tokenKeywords.some(keyword => messageText.includes(keyword))) {
        performLogout('Invalid or expired token');
        return Promise.reject(error);
      }
      
      // Normal yetki hatası - logout yapma
      return Promise.reject(error);
    }
    
    // 419: Session expired
    if (status === 419) {
      performLogout('Session expired');
      return Promise.reject(error);
    }
    
    // Network hatası
    if (!status && message === "Network Error") {
      // Offline kontrolü
      if (!navigator.onLine) {
        const offlineError = new Error('İnternet bağlantınızı kontrol edin');
        return Promise.reject(offlineError);
      }
      
      // Online ama network hatası
      console.error('Network error occurred while online');
      return Promise.reject(error);
    }
    
    // Rate limiting
    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const rateLimitError = new Error(
        `Çok fazla istek. ${retryAfter ? `${retryAfter} saniye sonra deneyin.` : 'Lütfen bekleyin.'}`
      );
      return Promise.reject(rateLimitError);
    }
    
    // Server errors (5xx)
    if (status >= 500) {
      console.error(`Server error ${status} from ${url}`);
      const serverError = new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      return Promise.reject(serverError);
    }
    
    // Diğer tüm hatalar
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

// API Health check
export async function checkAPIHealth(): Promise<boolean> {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Axios instance'ı export et
export default api;