// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import LoginForm from "./components/login/LoginForm";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";

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

      {/* default yönlendirme */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
