import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import LoginForm from "../components/login/LoginForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import RegisterUser from "../pages/users/RegisterUser";
import UsersList from "../pages/users/UsersList";
import ProfilePage from "../pages/profile/ProfilePage";
import RoleCreate from "../pages/roles/RoleCreate";
import RolesList from "../pages/roles/RolesList";
import DealersList from "../pages/dealers/DealersList";
import DealerCreate from "../pages/dealers/DealerCreate";
import CategoryCreate from "../pages/categories/CategoryCreate";
import CategoriesList from "../pages/categories/CategoriesList";
import ProductCreate from "../pages/products/ProductCreate";
import ProductsList from "../pages/products/ProductsList";
import ProductImagesPage from "../pages/products/ProductImagesPage";
import ProductDetails from "../pages/products/ProductDetails";
import DealerPricesPage from "../pages/dealers/DealerPricesPage";
import ProductPriceManagement from "../pages/products/ProductPriceManagement";
import OrderManagementPanel from "../pages/orders/OrderManagementPanel";

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
          <Route element={<ProtectedRoute />}>
            <Route path="/roles" element={<RolesList />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/roles/new" element={<RoleCreate />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dealers" element={<DealersList />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dealers-add" element={<DealerCreate />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/category-add" element={<CategoryCreate />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/category" element={<CategoriesList />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/product-add" element={<ProductCreate />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/product" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetails />} />{" "}
          </Route>

          <Route
            path="/dealers/:dealerId/prices"
            element={<DealerPricesPage />}
          />

          <Route
            path="/products/:productId/images"
            element={<ProductImagesPage />}
          />
          <Route path="/product-prices" element={<ProductPriceManagement />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/orders-list" element={<OrderManagementPanel />} />
          </Route>
        </Route>
      </Route>

      {/* default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
