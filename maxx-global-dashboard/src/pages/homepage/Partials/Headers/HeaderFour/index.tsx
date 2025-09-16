import { Link } from "react-router-dom";
import ThinBag from "../../../Helpers/icons/ThinBag";
import Middlebar from "./Middlebar";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../../../assets/img/medintera-logo.png";
import { getCart } from "../../../../../services/cart/storage";

type HeaderFourProps = {
  className?: string;
  drawerAction?: () => void;
};

export default function HeaderFour({
  className,
  drawerAction,
}: HeaderFourProps) {
  const [cartCount, setCartCount] = useState<number>(() => getCart().length);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const handleSearch = (query: string) => {
    navigate(`/homepage/all-products?search=${encodeURIComponent(query)}`);
  };
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
    <header className={`${className || ""} header-section-wrapper relative`}>
      <Middlebar className="quomodo-shop-middle-bar lg:block hidden" />

      {/* mobile drawer */}
      <div className="quomodo-shop-drawer lg:hidden block w-full h-[60px] bg-white">
        <div className="w-full h-full flex justify-between items-center px-5">
          <div onClick={drawerAction} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>

          <div>
            <Link to="/homepage">
              <img width={140} height={36} src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="cart relative cursor-pointer">
              <Link to="/homepage/basket">
                <span>
                  <ThinBag />
                </span>
              </Link>
              {cartCount > 0 && (
                <span className="w-[18px] h-[18px] text-white rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[10px]">
                  {cartCount}
                </span>
              )}
            </div>
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
      </div>

      <Navbar className="quomodo-shop-nav-bar lg:block hidden" />
    </header>
  );
}
