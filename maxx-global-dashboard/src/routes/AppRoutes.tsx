import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import LoginForm from "../components/login/LoginForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import RegisterUser from "../pages/users/RegisterUser";
import UsersList from "../pages/users/UsersList";
import ProfilePage from "../pages/profile/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public area */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      {/* Protected area with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* /users sadece USER_MANAGE */}
          <Route element={<ProtectedRoute required="USER_MANAGE" />}>
            <Route path="/users/register" element={<RegisterUser />} />

            <Route path="/users/list" element={<UsersList />} />
          </Route>
        </Route>
      </Route>

      {/* default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
