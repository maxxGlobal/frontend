import React from "react";

type CartProps = {
  className?: string;
  type?: number;
};

const cartItems = [
  {
    id: 1,
    title: "iPhone 12 Pro Max 128GB Golden colour",
    price: 38,
    image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`,
  },
  {
    id: 2,
    title: "iPhone 13 Mini 64GB Blue colour",
    price: 45,
    image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`,
  },
  {
    id: 3,
    title: "Samsung Galaxy S22 Ultra 256GB Black",
    price: 72,
    image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`,
  },
  // istediğin kadar ürün ekleyebilirsin
];

export default function Cart({ className, type }: CartProps) {
  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] rounded-xl overflow-hidden ${
        type === 3 ? "border-qh3-blue" : "cart-wrapper"
      } ${className || ""}`}
    >
      <div className="w-full h-full flex flex-col">
        {/* Ürünler */}
        <div className="product-items h-[310px] overflow-y-auto">
          <ul>
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-[55px] h-[55px] flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="title text-[13px] font-semibold text-qblack leading-4 line-clamp-2 hover:text-blue-600">
                      {item.title}
                    </p>
                    <span className="offer-price text-qred font-bold text-[15px]">
                      ${item.price}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-red-100 transition"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 8 8"
                    className="fill-current text-gray-400 hover:text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88 1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24-0.08 0.56-0.08 1.04 0.24 1.36L2.88 4 0.24 6.64C-0.08 6.96-0.08 7.44 0.24 7.76c0.32 0.32 0.8 0.32 1.12 0L4 5.12l2.64 2.64c0.32 0.32 0.8 0.32 1.12 0 0.32-0.32 0.32-0.8 0-1.12L5.12 4l2.64-2.64c0.32-0.32 0.32-0.8 0-1.12Z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Alt kısımlar */}
        <div className="px-4 mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[15px] font-medium text-qblack">
              Subtotal
            </span>
            <span className="text-[15px] font-bold text-qred">
              $
              {cartItems
                .reduce((total, item) => total + item.price, 0)
                .toFixed(2)}
            </span>
          </div>
          <div className="space-y-2">
            <a href="#">
              <div className="gray-btn w-full h-[45px] flex items-center justify-center rounded-md">
                <span>View Cart</span>
              </div>
            </a>
            <a href="#">
              <div
                className={`w-full h-[45px] flex items-center justify-center rounded-md text-white ${
                  type === 3 ? "bg-blue-600" : "bg-yellow-500"
                }`}
              >
                <span className="text-sm font-medium">Checkout Now</span>
              </div>
            </a>
          </div>
        </div>

        <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
          <p className="text-[13px] font-medium text-qgray">
            Get Return within <span className="text-qblack">30 days</span>
          </p>
        </div>
      </div>
    </div>
  );
}
