import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  return localStorage.getItem("token") ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
}
