// src/routes/ProtectedRoute.tsx - Enhanced version
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isTokenExpired, performLogout } from "../lib/api";

/** İzin kontrolü için props */
type Props = {
  /** Tek bir izin yeterli (örn: "USER_CREATE") */
  required?: string;
  /** Bu listedeki izinlerden herhangi biri yeterli */
  anyOf?: string[];
  /** Bu listedeki izinlerin hepsi gerekli */
  allOf?: string[];
  /** Yetkisizse yönlendirilecek sayfa */
  fallback?: string; // default: "/403"
  /** Bayi/son kullanıcı erişimini engelle */
  disallowDealers?: boolean;
  /** Bayi engelinde yönlendirilecek sayfa */
  dealerFallback?: string;
};

function readUserSafe() {
  try {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function collectPermissions(user: any): Set<string> {
  const set = new Set<string>();
  user?.roles?.forEach((r: any) =>
    r?.permissions?.forEach((p: any) => p?.name && set.add(p.name))
  );
  return set;
}

export default function ProtectedRoute({
  required,
  anyOf,
  allOf,
  fallback = "/403",
  disallowDealers = false,
  dealerFallback = "/homepage",
}: Props) {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Token validation
    const validateToken = () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      // Token geçerlilik kontrolü
      if (isTokenExpired(token)) {
        console.warn("Token expired during route validation");
        performLogout();
        return;
      }

      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  // Token validation devam ederken loading göster
  if (isValidating) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 1) Giriş kontrolü
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) Bayi / son kullanıcı engeli
  if (disallowDealers) {
    const isDealer = localStorage.getItem("isDealer") === "true";

    if (isDealer) {
      console.warn("Dealer users cannot access admin routes");
      return (
        <Navigate
          to={dealerFallback}
          replace
          state={{ from: location, message: "Admin paneline erişim yetkiniz yok." }}
        />
      );
    }
  }

  // 2) İzin kontrolü (props verilmişse)
  if (required || (anyOf && anyOf.length) || (allOf && allOf.length)) {
    const user = readUserSafe();
    
    // Kullanıcı verisi yoksa login'e yönlendir
    if (!user) {
      console.warn("User data not found in localStorage");
      performLogout();
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const perms = collectPermissions(user);

    // a) required
    if (required && !perms.has(required)) {
      return <Navigate to={fallback} replace />;
    }

    // b) anyOf
    if (anyOf && anyOf.length && !anyOf.some((p) => perms.has(p))) {
      return <Navigate to={fallback} replace />;
    }

    // c) allOf
    if (allOf && allOf.length && !allOf.every((p) => perms.has(p))) {
      return <Navigate to={fallback} replace />;
    }
  }

  // 3) Geçiş
  return <Outlet />;
}
