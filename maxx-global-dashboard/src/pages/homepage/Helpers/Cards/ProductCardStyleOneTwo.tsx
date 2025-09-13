import React from "react";
import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import ThinLove from "../icons/ThinLove";

// Artık ProductRow’dan ihtiyacımız olan alanları kapsayacak tip
export type ProductData = {
  id: number | string;
  image: string;
  title: string;
  price: number | null | undefined;
  offer_price?: number | null;
};

type ProductCardStyleOneTwoProps = {
  datas: ProductData;
};

export default function ProductCardStyleOneTwo({
  datas,
}: ProductCardStyleOneTwoProps) {
  // Boş görsel fallback
  const imageUrl =
    datas.image && datas.image.trim() !== ""
      ? datas.image
      : "src/assets/img/resim-yok.jpg";

  const fmtPrice = (v?: number | null) =>
    v != null
      ? Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2 })
      : "";

  return (
    <div
      className="product-card-style-one-two w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0,0,0,0.05)" }}
    >
      {/* Ürün görseli */}
      <div
        className="product-card-img w-full h-[322px] mt-4 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* İçerik */}
      <div className="product-card-details flex justify-center h-[120px] items-center relative px-4">
        {/* Sepete ekle butonu */}
        <div className="absolute w-[204px] h-[54px] left-1/2 -translate-x-1/2 -bottom-20 group-hover:bottom-[65px] transition-all duration-300 ease-in-out">
          <button type="button" className="yellow-btn w-full h-full">
            Sepete Ekle
          </button>
        </div>

        <div className="text-center">
          <Link to={`/homepage/product/${datas.id}`}>
            <p className="title mb-2 text-[20px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
              {datas.title}
            </p>
          </Link>

          {/* Kategori / Stok bilgisi opsiyonel */}
          {datas.categoryName && (
            <p className="text-xs text-gray-500 mb-1">{datas.categoryName}</p>
          )}
          {datas.stockQuantity != null && (
            <p className="text-xs text-gray-500 mb-1">
              Stok: {datas.stockQuantity} {datas.unit ?? ""}
            </p>
          )}

          {/* Fiyatlar */}
          <div className="price flex justify-center space-x-2">
            {datas.offer_price && datas.offer_price < datas.price ? (
              <>
                <span className="offer-price text-qred font-600 text-[18px]">
                  {fmtPrice(datas.offer_price)}
                </span>
                <span className="main-price text-qgray line-through font-600 text-[16px]">
                  {fmtPrice(datas.price)}
                </span>
              </>
            ) : (
              <span className="offer-price text-qblack font-600 text-[18px]">
                {fmtPrice(datas.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hızlı erişim butonları */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-[50px] -right-[50px] top-20 transition-all duration-300 ease-in-out">
        <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
          <QuickViewIco />
        </button>
        <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
          <ThinLove />
        </button>
        <button className="w-10 h-10 flex justify-center items-center bg-[#CCECEB] rounded">
          <Compair />
        </button>
      </div>
    </div>
  );
}
