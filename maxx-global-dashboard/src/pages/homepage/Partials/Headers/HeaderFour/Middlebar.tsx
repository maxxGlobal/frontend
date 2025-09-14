// src/pages/Partials/HomeTwo/Middlebar/index.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cart from "../../../Cart";
import { useQuery } from "@tanstack/react-query";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import SearchBox from "../../../Helpers/SearchBox";
import Logo from "../../../../../assets/img/medintera-logo.png";
import { getFavoriteCount } from "../../../../../services/favorites/count";
import { getCart } from "../../../../../services/cart/storage";

type MiddlebarProps = {
  className?: string;
};

export default function Middlebar({ className }: MiddlebarProps) {
  // Favori sayısı (değişmeden bırakıyoruz)
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["favoriteCount"],
    queryFn: getFavoriteCount,
    refetchInterval: 60_000,
  });

  // 🔢 Sepetteki FARKLI ÜRÜN sayısı
  const [cartCount, setCartCount] = useState<number>(() => getCart().length);

  useEffect(() => {
    const update = () => setCartCount(getCart().length);

    update(); // ilk yükleme
    window.addEventListener("storage", update); // başka sekme
    window.addEventListener("cart:changed", update); // aynı sekme
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart:changed", update);
    };
  }, []);

  return (
    <div className={`w-full h-[86px] bg-white ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* logo */}
            <Link to="/homepage">
              <img width={240} height={36} src={Logo} alt="logo" />
            </Link>

            {/* search box */}
            <div className="w-[517px] h-[44px]">
              <SearchBox className="search-com" />
            </div>

            {/* icons */}
            <div className="flex space-x-6 items-center">
              {/* wishlist */}
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

              {/* cart */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
