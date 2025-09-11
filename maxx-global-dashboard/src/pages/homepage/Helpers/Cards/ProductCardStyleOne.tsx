// src/pages/Helpers/Cards/ProductCardStyleOne.tsx
import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";

export type ProductCardData = {
  id: number | string;
  image: string;
  title: string;
  price?: number | null; // ← opsiyonel yaptık
  offer_price?: number | null;
  review?: number;
  slug?: string;

  // Opsiyonel: kampanya/rozet
  campaingn_product?: boolean;
  cam_product_sale?: number;
  cam_product_available?: number;
  product_type?: string;
  subtitlecode?: string; // ← code / kategori gibi alt yazı için
  subtitlecategory?: string;
};

type ProductRowLike = {
  id: number | string;
  name?: string | null;
  code?: string | null;
  categoryName?: string | null; // ← burası genişledi
  primaryImageUrl?: string | null;
  price?: number | null;
  salePrice?: number | null;
  discountedPrice?: number | null;
  slug?: string | null;
  rating?: number | null;
  review?: number | null;
  [k: string]: any;
};

type Props = {
  datas: ProductCardData | ProductRowLike;
  type?: number;
};

const PUBLIC_FALLBACK = `${
  import.meta.env.VITE_PUBLIC_URL ?? ""
}/assets/images/placeholder.png`;

function buildImageUrl(u?: string | null) {
  if (!u || u.trim() === "") return PUBLIC_FALLBACK;
  return u; // API mutlak url dönüyor
}

function fmtPrice(val?: number | null) {
  if (val == null) return "";
  return Number(val).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Gelen (ProductRow) → karta normalize
function toCardData(input: ProductCardData | ProductRowLike): ProductCardData {
  // zaten kart datas ise döndür
  if ((input as any).title && (input as any).image) {
    return input as ProductCardData;
  }
  const row = input as ProductRowLike;

  // fiyat yoksa null kalsın → UI fiyat bölümünü gizler
  const price = row.price ?? row.discountedPrice ?? row.salePrice ?? null;

  // alt başlık: (Kod - Kategori) gibi
  const subtitlecode = [row.code ? `Kod: ${row.code}` : null].filter(Boolean);
  const subtitlecategory = [
    row.categoryName ? `Kategori: ${row.categoryName}` : null,
  ];
  return {
    id: row.id,
    title: row.name ?? String(row.id),
    image: buildImageUrl(row.primaryImageUrl),
    price: price,
    offer_price: null,
    review: row.review ?? row.rating ?? 0,
    subtitlecode: subtitlecode.join(" • "),
    subtitlecategory: subtitlecategory.join(" • "),
  };
}

export default function ProductCardStyleOne({ datas, type }: Props) {
  const d = toCardData(datas);

  const hasCampaign =
    !!d.campaingn_product &&
    typeof d.cam_product_sale === "number" &&
    typeof d.cam_product_available === "number";

  const total = (d.cam_product_available ?? 0) + (d.cam_product_sale ?? 0);
  const soldPct = total > 0 ? (100 * (d.cam_product_sale ?? 0)) / total : 0;

  const showStrike =
    typeof d.offer_price === "number" &&
    (d.offer_price as number) < (d.price ?? Infinity);

  const detailHref = d.slug
    ? `/homepage/product/${d.slug}`
    : `/homepage/product/${d.id}`;

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Görsel */}
      <div
        className="product-card-img w-full h-[300px] bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${d.image})` }}
      >
        {/* {hasCampaign && (
          <div className="px-[30px] absolute left-0 top-3 w-full">
            <div className="progress-title flex justify-between">
              <p className="text-xs text-qblack font-400 leading-6">
                Products Available
              </p>
              <span className="text-sm text-qblack font-600 leading-6">
                {d.cam_product_available}
              </span>
            </div>
            <div className="progress w-full h-[5px] rounded-[22px] bg-primarygray relative overflow-hidden">
              <div
                style={{ width: `${soldPct}%` }}
                className={`h-full absolute left-0 top-0 ${
                  type === 3 ? "bg-qh3-blue" : "bg-qyellow"
                }`}
              />
            </div>
          </div>
        )} */}

        {d.product_type && !hasCampaign && (
          <div className="product-type absolute right-[14px] top-[17px]">
            <span
              className={`text-[9px] font-700 leading-none py-[6px] px-3 uppercase text-white rounded-full tracking-wider ${
                d.product_type === "popular" ? "bg-[#19CC40]" : "bg-qyellow"
              }`}
            >
              {d.product_type}
            </span>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="product-card-details px-[30px] pb-[30px] relative">
        {/* add to cart */}
        <div className="absolute w-full h-10 px-[30px] left-0 top-30 group-hover:top-[42px] transition-all duration-300 ease-in-out">
          <button
            type="button"
            className={type === 3 ? "blue-btn" : "yellow-btn cursor-pointer"}
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
                  <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176ZM12.982 14.8037C12.9788 14.8266 12.953 14.8952 12.9079 14.9443L12.8435 15.0162H1.13943L0.971907 14.8331L1.63233 9.82901C1.86429 8.04766 2.07047 6.4951 2.19289 5.56684C2.24766 5.16154 2.27343 4.95563 2.28631 4.8543C2.72123 4.85103 4.62196 4.84776 6.98661 4.84776H11.6901L11.6966 4.88372C11.7481 5.1452 12.9594 14.5128 12.982 14.8037ZM4.77338 3.8574V3.48479C4.77338 3.23311 4.80559 2.88664 4.84103 2.72649C5.03111 1.90935 5.67864 1.24584 6.48726 1.03339C6.82553 0.948403 7.37964 0.97782 7.71791 1.10202H7.72113C8.0755 1.22296 8.36545 1.41907 8.63284 1.71978C9.06453 2.19698 9.2095 2.62516 9.2095 3.41615V3.8574H4.77338Z"></path>
                </svg>
              </span>
              <span>Sepete Ekle</span>
            </div>
          </button>
        </div>

        <Link to={detailHref}>
          <p className="title my-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {d.title}
          </p>
        </Link>
        {d.subtitlecode && (
          <p className="text-[12px] text-qgray mb-2 line-clamp-1">
            {d.subtitlecode}
          </p>
        )}
        {d.subtitlecategory && (
          <p className="text-[12px] text-qgray mb-2 line-clamp-1">
            {d.subtitlecategory}
          </p>
        )}

        {/* Fiyatlar: price yoksa gizle */}
        {d.price != null && (
          <p className="price">
            {showStrike ? (
              <>
                <span className="main-price text-qgray line-through font-600 text-[18px]">
                  {fmtPrice(d.price)}
                </span>
                <span className="offer-price text-qred font-600 text-[18px] ml-2">
                  {fmtPrice(d.offer_price ?? d.price)}
                </span>
              </>
            ) : (
              <span className="offer-price text-qblack font-600 text-[18px]">
                {fmtPrice(d.offer_price ?? d.price)}
              </span>
            )}
          </p>
        )}
      </div>

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
    </div>
  );
}
