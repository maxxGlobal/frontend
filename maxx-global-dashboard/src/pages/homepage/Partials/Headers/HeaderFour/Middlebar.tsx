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
import { getUnreadCount } from "../../../../../services/notifications/header";
import { getCart } from "../../../../../services/cart/storage";

type MiddlebarProps = { className?: string };

export default function Middlebar({ className }: MiddlebarProps) {
  const navigate = useNavigate();

  // ---- Counts ----
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["favoriteCount"],
    queryFn: getFavoriteCount,
    refetchInterval: 60_000,
  });

  // 🔑 okunmamış bildirim sayısı
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: getUnreadCount,
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

  const handleSearch = (query: string) => {
    if (!query) return;
    navigate(`/homepage/all-product?search=${encodeURIComponent(query)}`);
  };

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
                <button className="Btn" onClick={handleLogout}>
                  <div className="sign">
                    <svg viewBox="0 0 512 512">
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                    </svg>
                  </div>
                  <div className="text">Çıkış Yap</div>
                </button>
              </div>
            </div>
            {/* End Right Icons */}
          </div>
        </div>
      </div>
    </div>
  );
}
