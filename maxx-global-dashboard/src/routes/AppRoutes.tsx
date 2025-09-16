import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../components/layout/AuthLayout";
import LoginForm from "../components/login/LoginForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
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
import DealerDetail from "../pages/dealers/DealerDetail";
import DiscountsList from "../pages/discounts/DiscountsList";
import DiscountCreate from "../pages/discounts/DiscountCreate";
import DiscountCalculate from "../pages/discounts/DiscountCalculate";
import DiscountsUpcoming from "../pages/discounts/DiscountsUpcoming";
import DiscountsByProduct from "../pages/discounts/DiscountsByProduct";
import DiscountsExpired from "../pages/discounts/DiscountsExpired";
import DiscountsByDealer from "../pages/discounts/DiscountsByDealer";
import AdminBroadcastPanel from "../pages/notifications/AdminBroadcastPanel";
import AdminNotificationsList from "../pages/notifications/AdminNotificationsList";
import MyNotificationsPage from "../pages/notifications/MyNotificationsPage";
import OrderDetailPage from "../pages/orders/OrderDetailPage";
import PublicHomeLayout from "../components/layout/PublicHomeLayout";
import MovementsByProduct from "../pages/stock/MovementsByProduct";
import DailySummary from "../pages/stock/DailySummary";
import TopMovements from "../pages/stock/TopMovements";
const HomePage = lazy(() => import("../pages/homepage/HomeTwo"));
const AllProductPage = lazy(() => import("../pages/homepage/AllProductPage"));
const FlashProduct = lazy(() => import("../pages/homepage/FlashSale"));
const Contact = lazy(() => import("../pages/homepage/Contact"));
const About = lazy(() => import("../pages/homepage/About"));
const ProductDetail = lazy(() => import("../pages/homepage/SingleProductPage"));
const BasketDetail = lazy(() => import("../pages/homepage/BasketDetail/index"));
const MyOrders = lazy(() => import("../pages/homepage/BasketDetail/my-orders"));
const Kvkk = lazy(() => import("../pages/homepage/PrivacyPolicy"));
const TermsCondition = lazy(
  () => import("../pages/homepage/TermsCondition/index")
);
const NotificationDetail = lazy(
  () => import("../pages/homepage/Notifications/Detail")
);
const FavoriteProduct = lazy(
  () => import("../pages/homepage/FavoritesProductPage")
);
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public area */}
      <Route>
        <Route element={<PublicHomeLayout />}>
          <Route
            path="/homepage"
            element={
              <Suspense fallback={null}>
                <HomePage />
              </Suspense>
            }
          />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/all-product" element={<AllProductPage />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/flash-sale" element={<FlashProduct />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/contact" element={<Contact />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/about" element={<About />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/product/:id" element={<ProductDetail />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/favorites" element={<FavoriteProduct />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/basket" element={<BasketDetail />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route
            path="/homepage/notifications"
            element={<NotificationDetail />}
          />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/my-orders" element={<MyOrders />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/quality-policy" element={<TermsCondition />} />
        </Route>
        <Route element={<PublicHomeLayout />}>
          <Route path="/homepage/kvkk" element={<Kvkk />} />
        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>

      {/* Protected area with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ✅ Users - daha esnek yetki */}
          <Route
            element={
              <ProtectedRoute
                anyOf={["USER_READ", "USER_MANAGE", "SYSTEM_ADMIN"]}
              />
            }
          >
            <Route path="/users/list" element={<UsersList />} />
          </Route>
          <Route
            element={<ProtectedRoute anyOf={["USER_MANAGE", "SYSTEM_ADMIN"]} />}
          >
            <Route path="/users/register" element={<RegisterUser />} />
          </Route>

          {/* ✅ Roles - ADMIN'e de izin ver */}
          <Route element={<ProtectedRoute anyOf={["SYSTEM_ADMIN", "ADMIN"]} />}>
            <Route path="/roles" element={<RolesList />} />
          </Route>
          <Route element={<ProtectedRoute required="SYSTEM_ADMIN" />}>
            <Route path="/roles/new" element={<RoleCreate />} />
          </Route>

          {/* ✅ Dealers - daha esnek yetki */}
          <Route
            element={
              <ProtectedRoute
                anyOf={["DEALER_READ", "DEALER_MANAGE", "SYSTEM_ADMIN"]}
              />
            }
          >
            <Route path="/dealers" element={<DealersList />} />
          </Route>
          <Route
            element={
              <ProtectedRoute anyOf={["DEALER_MANAGE", "SYSTEM_ADMIN"]} />
            }
          >
            <Route path="/dealers-add" element={<DealerCreate />} />
          </Route>

          {/* ✅ Categories - daha esnek yetki */}
          <Route
            element={
              <ProtectedRoute anyOf={["CATEGORY_MANAGE", "SYSTEM_ADMIN"]} />
            }
          >
            <Route path="/category-add" element={<CategoryCreate />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                anyOf={["CATEGORY_READ", "CATEGORY_MANAGE", "SYSTEM_ADMIN"]}
              />
            }
          >
            <Route path="/category" element={<CategoriesList />} />
          </Route>

          {/* ✅ Products - daha esnek yetki */}
          <Route
            element={
              <ProtectedRoute anyOf={["PRODUCT_MANAGE", "SYSTEM_ADMIN"]} />
            }
          >
            <Route path="/product-add" element={<ProductCreate />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                anyOf={["PRODUCT_READ", "PRODUCT_MANAGE", "SYSTEM_ADMIN"]}
              />
            }
          >
            <Route path="/product" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
          </Route>

          {/* Diğer rotalar aynı kalabilir */}
          <Route
            path="/dealers/:dealerId/prices"
            element={<DealerPricesPage />}
          />
          <Route
            path="/products/:productId/images"
            element={<ProductImagesPage />}
          />
          <Route path="/product-prices" element={<ProductPriceManagement />} />
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/orders-list" element={<OrderManagementPanel />} />
          </Route>
          <Route path="/dealers/:id" element={<DealerDetail />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/discounts-list" element={<DiscountsList />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/discounts-create" element={<DiscountCreate />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/discounts/calculate"
              element={<DiscountCalculate />}
            />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/discounts/upcoming" element={<DiscountsUpcoming />} />
          </Route>
          <Route
            path="/discounts/by-product"
            element={<DiscountsByProduct />}
          />
          <Route path="/discounts/expired" element={<DiscountsExpired />} />
          <Route path="/discounts/by-dealer" element={<DiscountsByDealer />} />
          <Route
            path="/notifications/broadcast"
            element={<AdminBroadcastPanel />}
          />
          <Route path="/notifications" element={<AdminNotificationsList />} />
          <Route path="/my-notifications" element={<MyNotificationsPage />} />
          {/* Stok İşlemleri - DashboardLayout içinde, diğer protected route'larla birlikte */}
          <Route
            element={
              <ProtectedRoute
                anyOf={["PRODUCT_READ", "PRODUCT_MANAGE", "SYSTEM_ADMIN"]}
              />
            }
          >
            <Route
              path="/stock/movements-by-product"
              element={<MovementsByProduct />}
            />
            <Route path="/stock/daily-summary" element={<DailySummary />} />
            <Route path="/stock/top-movements" element={<TopMovements />} />
          </Route>
        </Route>
      </Route>

      {/* default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
