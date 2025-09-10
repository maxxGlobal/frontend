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
  subtitle?: string; // ← code / kategori gibi alt yazı için
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
  const subtitleParts = [
    row.code ? `Kod: ${row.code}` : null,
    row.categoryName ? `Kategori: ${row.categoryName}` : null,
  ].filter(Boolean);

  return {
    id: row.id,
    title: row.name ?? String(row.id),
    image: buildImageUrl(row.primaryImageUrl),
    price: price,
    offer_price: null,
    review: row.review ?? row.rating ?? 0,
    subtitle: subtitleParts.join(" • "),
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
    ? `/single-product/${d.slug}`
    : `/single-product/${d.id}`;

  return (
    <div data-aos="fade-up" className="aos-init aos-animate">
      <div
        className="product-card-one w-full h-full bg-white relative group overflow-hidden"
        style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
      >
        {/* Görsel */}
        <div
          className="product-card-img w-full h-[300px] bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: `url(${d.image})` }}
        >
          {hasCampaign && (
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
          )}

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
          <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out">
            <button
              type="button"
              className={type === 3 ? "blue-btn" : "yellow-btn"}
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

          {/* Yıldızlar (opsiyonel) */}
          {!!d.review && d.review > 0 && (
            <div className="reviews flex space-x-[1px] mb-3">
              {Array.from({ length: Math.min(5, d.review) }, (_, i) => (
                <span key={`review-${i}`}>
                  <Star />
                </span>
              ))}
            </div>
          )}

          {/* Başlık / Link */}
          <Link to={detailHref}>
            <p className="title mb-1 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
              {d.title}
            </p>
          </Link>

          {/* Alt yazı: Kod / Kategori (varsa) */}
          {d.subtitle && (
            <p className="text-[12px] text-qgray mb-2 line-clamp-1">
              {d.subtitle}
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

        {/* quick-access-btns */}
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
    </div>
  );
}
