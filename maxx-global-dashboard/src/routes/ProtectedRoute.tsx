// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

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
}: Props) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // 1) Giriş kontrolü
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) İzin kontrolü (props verilmişse)
  if (required || (anyOf && anyOf.length) || (allOf && allOf.length)) {
    const user = readUserSafe();
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
