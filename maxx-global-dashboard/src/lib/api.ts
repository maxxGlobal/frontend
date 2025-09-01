// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true, // cookie-based auth ise true
});

// Eğer hem localStorage hem cookie desteği olsun istiyorsan:
function getTokenFromStorageOrCookie() {
  const ls = localStorage.getItem("token");
  if (ls) return ls.startsWith("Bearer ") ? ls.slice(7) : ls;

  // HttpOnly değilse cookie’den de dener (HttpOnly ise zaten görünmez)
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

api.interceptors.request.use((config) => {
  const token = getTokenFromStorageOrCookie();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
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

export default api;
