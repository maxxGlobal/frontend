import { Link } from "react-router-dom";
import Cart from "../../../Cart";
import Compair from "../../../Helpers/icons/Compair";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import ThinPeople from "../../../Helpers/icons/ThinPeople";
import SearchBox from "../../../Helpers/SearchBox";

type MiddlebarProps = {
  className?: string;
  compareCount?: number;
  wishlistCount?: number;
  cartCount?: number;
};

export default function Middlebar({
  className,
  compareCount = 2,
  wishlistCount = 1,
  cartCount = 15,
}: MiddlebarProps) {
  return (
    <div className={`w-full h-[86px] bg-white ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* logo */}
            <div>
              <Link to="/">
                <img
                  width={152}
                  height={36}
                  src={`src/assets/img/logo-max.png`}
                  alt="logo"
                />
              </Link>
            </div>

            {/* search box */}
            <div className="w-[517px] h-[44px]">
              <SearchBox className="search-com" />
            </div>

            {/* icons */}
            <div className="flex space-x-6 items-center">
              {/* compare */}
              <div className="compaire relative">
                <Link to="/products-compaire">
                  <span>
                    <Compair />
                  </span>
                </Link>
                {compareCount > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                    {compareCount}
                  </span>
                )}
              </div>

              {/* wishlist */}
              <div className="favorite relative">
                <Link to="/wishlist">
                  <span>
                    <ThinLove />
                  </span>
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
                  <Link to="/cart">
                    <span>
                      <ThinBag />
                    </span>
                  </Link>
                  {cartCount > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                {/* dropdown cart on hover */}
                <Cart className="absolute -right-[45px] top-11 z-50 hidden group-hover:block" />
              </div>

              {/* profile */}
              <div>
                <Link to="/my-profile">
                  <span>
                    <ThinPeople />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
