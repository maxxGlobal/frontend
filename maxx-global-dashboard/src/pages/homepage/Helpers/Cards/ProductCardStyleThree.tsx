import QuickViewIco from "../icons/QuickViewIco";
import ThinLove from "../icons/ThinLove";
import Compair from "../icons/Compair";

type ProductData = {
  image: string;
};

type ProductCardStyleThreeProps = {
  datas: ProductData;
};

function ProductCardStyleThree({ datas }: ProductCardStyleThreeProps) {
  return (
    <div className="product-cart-three w-full group">
      {/* thumb */}
      <div className="w-full h-[364px] bg-white flex justify-center items-center p-2.5 mb-6 relative overflow-hidden">
        <img
          src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/${
            datas.image
          }`}
          alt="product"
        />
        <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-20 transition-all duration-300 ease-in-out">
          <a href="#">
            <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
              <QuickViewIco />
            </span>
          </a>
          <a href="#">
            <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
              <ThinLove />
            </span>
          </a>
          <a href="#">
            <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
              <Compair />
            </span>
          </a>
        </div>

        <div className="absolute w-full h-10 px-[30px] left-0 -bottom-10 group-hover:bottom-5 transition-all duration-300 ease-in-out">
          <button
            type="button"
            className="black-btn w-full h-full flex justify-center items-center"
          >
            <div className="flex items-center space-x-3">
              <span>
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current"
                >
                  <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176Z" />
                </svg>
              </span>
              <span>Add To Cart</span>
            </div>
          </button>
        </div>
      </div>

      <h2 className="text-xl leading-6 font-medium text-qblack mb-2">
        Women's Shirt Dress
      </h2>
      <p className="text-base leading-6 font-medium text-qgraytwo">
        $9.99 <span className="text-qred">$6.99</span>
      </p>
    </div>
  );
}

export default ProductCardStyleThree;
