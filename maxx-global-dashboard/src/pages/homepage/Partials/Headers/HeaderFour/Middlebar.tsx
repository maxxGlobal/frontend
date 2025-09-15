// src/components/layout/middlebar/index.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cart from "../../../Cart";
import NotificationCart from "../../../Notifications/Cart";
import { useQuery } from "@tanstack/react-query";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import Bell from "../../../Helpers/icons/Bell";
import ThinPeople from "../../../Helpers/icons/ThinPeople";
import SearchBox from "../../../Helpers/SearchBox";
import Logo from "../../../../../assets/img/medintera-logo.png";
import { getFavoriteCount } from "../../../../../services/favorites/count";
import { getCart } from "../../../../../services/cart/storage";
import { listNotifications } from "../../../../../services/notifications/list";

type MiddlebarProps = {
  className?: string;
};

export default function Middlebar({ className }: MiddlebarProps) {
  const navigate = useNavigate();

  // ---- Counts ----
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["favoriteCount"],
    queryFn: getFavoriteCount,
    refetchInterval: 60_000,
  });
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      const res = await listNotifications({});
      return (res.content ?? []).length;
    },
    refetchInterval: 60_000,
  });
  const [cartCount, setCartCount] = useState<number>(() => getCart().length);

  useEffect(() => {
    const update = () => setCartCount(getCart().length);
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart:changed", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart:changed", update);
    };
  }, []);

  // ---- Search ----
  const handleSearch = (query: string) => {
    if (!query) return;
    navigate(`/homepage/all-product?search=${encodeURIComponent(query)}`);
  };

  // ---- Logout ----
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`w-full h-[86px] bg-white ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/homepage">
              <img width={240} height={36} src={Logo} alt="logo" />
            </Link>

            {/* Search */}
            <div className="w-[517px] h-[44px]">
              <SearchBox className="search-com" onSearch={handleSearch} />
            </div>

            {/* Right Icons */}
            <div className="flex space-x-6 items-center">
              {/* Notifications */}
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link to="/homepage/notifications">
                    <Bell />
                  </Link>
                  {notificationCount > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2 -right-1 flex justify-center items-center text-[9px] text-white">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <NotificationCart className="absolute -right-[45px] top-11 z-50 hidden group-hover:block" />
              </div>

              {/* Favorites */}
              <div className="favorite relative">
                <Link to="/homepage/favorites">
                  <ThinLove />
                </Link>
                {wishlistCount > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>

              {/* Cart */}
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link to="/homepage/basket">
                    <ThinBag />
                  </Link>
                  {cartCount > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <Cart className="absolute -right-[45px] top-11 z-50 hidden group-hover:block" />
              </div>

              {/* User / Logout */}
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <ThinPeople />
                </div>

                {/* Hover dropdown for logout */}
                <div className="absolute right-0 top-11 z-50  hidden group-hover:block">
                  <div className="bg-white  border-black rounded shadow-md min-w-[120px]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 border rounded text-sm text-qh2-green hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* End Right Icons */}
          </div>
        </div>
      </div>
    </div>
  );
}
