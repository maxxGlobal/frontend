// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import LoginForm from "./components/login/LoginForm";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import RegisterAdd from "./components/layout/RegisterAdd";
import UsersList from "./components/layout/UsersList";
import ProfilePage from "./components/layout/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Giriş yapılmışsa /login'e girmesin */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      {/* Korumalı alan */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/vendors" element={<Vendors />} /> ... */}
        </Route>
      </Route>
      {/* ✅ Register route korumalı */}
      <Route element={<ProtectedRoute required="USER_MANAGE" />}>
        <Route path="/users/register" element={<RegisterAdd />} />
      </Route>
      <Route element={<ProtectedRoute required="USER_MANAGE" />}>
        <Route path="/users/list" element={<UsersList />} />
      </Route>
      <Route path="/profile" element={<ProfilePage />} />

      {/* default yönlendirme */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
