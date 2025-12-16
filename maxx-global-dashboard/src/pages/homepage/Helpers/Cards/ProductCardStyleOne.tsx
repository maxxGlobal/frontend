/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import ThinLove from "../icons/ThinLove";
import { addFavorite } from "../../../../services/favorites/add";
import { removeFavorite } from "../../../../services/favorites/remove";
import type { Product } from "../../../../types/product";
 
type Props = {
  datas: Product;
  filterMaterials?: string[];
};

const PUBLIC_FALLBACK = `${
  import.meta.env.VITE_PUBLIC_URL ?? ""
}/assets/images/placeholder.png`;
function buildImageUrl(u?: string | null) {
  if (!u || u.trim() === "") return PUBLIC_FALLBACK;
  return u;
}
function matchesMaterials(prod: Product, selected: string[] = []) {
  if (!selected.length) return true;

  const rawList =
    (prod as any)?.materials ??
    (prod as any)?.attributes?.materials ??
    (typeof (prod as any)?.material === "string"
      ? [(prod as any).material]
      : []);

  const list: string[] = Array.isArray(rawList) ? rawList : [];
  if (!list.length) return false;

  const norm = (s: string) => s.trim().toLowerCase();
  const prodSet = new Set(list.map(norm));
  return selected.some((m) => prodSet.has(norm(m)));
}

export default function ProductCardStyleOne({ datas, filterMaterials }: Props) {
  if (datas.status !== "AKTİF") return null;
  if (!matchesMaterials(datas, filterMaterials)) return null;
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const d = datas;
  const [isFav, setIsFav] = useState<boolean>(!!d.isFavorite);

  const formatAmount = (amount: number, currency?: string | null) => {
    try {
      return new Intl.NumberFormat(i18n.language || "tr", {
        style: "currency",
        currency: currency || "TRY",
      }).format(amount);
    } catch {
      const formatted = Number.isFinite(amount) ? amount.toFixed(2) : String(amount);
      return `${formatted}${currency ? ` ${currency}` : ""}`.trim();
    }
  };


  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isFav) {
        setIsFav(false);
        await removeFavorite(d.id);
      } else {
        setIsFav(true);
        await addFavorite({ productId: d.id });
      }
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      setIsFav((prev) => !prev);
      Swal.fire({
        icon: "error",
        title: t("pages.productCard.favoriteErrorTitle"),
        text: t("pages.productCard.favoriteErrorText"),
      });
    }
  }

  // Miktar alanları için event propagation'ı durdur
  const stopPropagation = (
    e: React.MouseEvent | React.FocusEvent | React.ChangeEvent
  ) => {
    e.stopPropagation();
  };

  // Card container'a tıklandığında ürün detayına git
  const handleCardClick = () => {
    // React Router ile yönlendirme yap ki state korunsun
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams.toString();
    const productUrl = `/homepage/product/${d.id}${
      searchParams ? `?${searchParams}` : ""
    }`;

    // Navigate kullanarak yönlendirme yap
    window.history.pushState(null, "", productUrl);
    window.location.href = productUrl;
  };

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden rounded-[8px] cursor-pointer hover:shadow-lg transition-shadow duration-300"
      style={{ boxShadow: "0px 15px 64px rgba(0,0,0,0.05)" }}
      onClick={handleCardClick}
    >
      <div
        className="product-card-img w-full h-[300px] bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: `url(${buildImageUrl(d.primaryImageUrl)})`,
        }}
      />

      <div className="product-card-details px-[30px] pb-[30px] relative">
        {/* Link'i kaldırıyoruz çünkü card'ın kendisi tıklanabilir */}
        <p className="title my-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
          {d.name}
        </p>

        {d.code && (
          <p className="text-[12px] text-qgray mb-1">
            {t("pages.productCard.codeLabel")}: {d.code}
          </p>
        )}
        {d.categoryName && (
          <p className="text-[12px] text-qgray mb-2">
            {t("pages.productCard.categoryLabel")}: {d.categoryName}
          </p>
        )}
        {d.material !== undefined && d.material !== null && (
          <p className="text-[12px] text-qgray mb-2">
            {t("pages.productCard.materialLabel")}: {d.material || "—"}
          </p>
        )} 
      </div>

      {/* Favori butonu */}
      <div
        className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-2 transition-all duration-300"
        onClick={stopPropagation}
      >
        <button
          type="button"
          onClick={handleFavorite}
          className="w-10 h-10 flex justify-center items-center bg-primarygray rounded"
        >
          <ThinLove fillColor={isFav ? "red" : "white"} />
        </button>
      </div>
    </div>
  );
}
