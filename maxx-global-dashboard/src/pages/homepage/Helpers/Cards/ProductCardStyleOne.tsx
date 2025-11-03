import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import ThinLove from "../icons/ThinLove";
import { addFavorite } from "../../../../services/favorites/add";
import { removeFavorite } from "../../../../services/favorites/remove";
import type { Product } from "../../../../types/product";
import { addToCart } from "../../../../services/cart/storage";
import { useCart } from "../../Helpers/CartContext";

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
  const { refresh } = useCart();
  const qc = useQueryClient();
  const d = datas;
  const [isFav, setIsFav] = useState<boolean>(!!d.isFavorite);
  const [quantity, setQuantity] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const [hiddenAfterClick, setHiddenAfterClick] = useState(false);

  const increment = () => {
    setQuantity((p) => {
      const n = p + 1;
      setInputValue(String(n));
      return n;
    });
  };

  const decrement = () => {
    setQuantity((p) => {
      const n = Math.max(1, p - 1);
      setInputValue(String(n));
      return n;
    });
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) setQuantity(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      try {
        e.target.select();
      } catch {}
    }, 0);

    if (inputValue === "1") {
      setInputValue("");
    }
  };

  const handleBlur = () => {
    if (inputValue.trim() === "") {
      setInputValue(String(quantity || 1));
    } else {
      const n = Math.max(1, parseInt(inputValue, 10) || 1);
      setQuantity(n);
      setInputValue(String(n));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const priceId = d.prices?.[0]?.productPriceId ?? null;
    if (!priceId) {
      Swal.fire({
        icon: "error",
        title: "Fiyat bulunamadı",
        text: "Bu ürün için fiyat bilgisi bulunamadı.",
      });
      return;
    }

    try {
      await addToCart(d.id, quantity, { productPriceId: priceId });
      refresh();
      setHiddenAfterClick(true);
      await Swal.fire({
        icon: "success",
        title: "Sepete eklendi",
        text: `${d.name} ürününden ${quantity} adet sepete eklendi`,
        confirmButtonText: "Tamam",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Ürün sepete eklenirken bir hata oluştu.";
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: message,
      });
    } finally {
      setHiddenAfterClick(false);
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
        title: "Hata",
        text: "Favori işlemi başarısız",
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

        {d.code && <p className="text-[12px] text-qgray mb-1">Kod: {d.code}</p>}
        {d.categoryName && (
          <p className="text-[12px] text-qgray mb-2">
            Kategori: {d.categoryName}
          </p>
        )}
        {d.material !== undefined && d.material !== null && (
          <p className="text-[12px] text-qgray mb-2">
            Materyal: {d.material || "—"}
          </p>
        )}
        {d.prices?.length ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {d.prices.map((p) => (
              <span
                key={p.productPriceId}
                className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-qblack"
              >
                {p.amount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: p.currency || "TRY",
                })}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-qgray mt-2">Fiyat bilgisi yok</p>
        )}

        {!hiddenAfterClick && (
          <div
            className="absolute flex w-[234px] h-[54px] left-1/2 -translate-x-1/2
               -bottom-20 opacity-0 group-hover:bottom-[20px] group-hover:opacity-100
               transition-all duration-300"
            onClick={stopPropagation}
          >
            <button
              type="button"
              onClick={handleAddToCart}
              className="yellow-btn w-full h-full cursor-pointer"
            >
              Sepete Ekle
            </button>
            <div
              className="w-[130px] h-full px-[10px] flex items-center border bg-white border-qgray-border"
              onClick={stopPropagation}
            >
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={(e) => {
                    stopPropagation(e);
                    decrement();
                  }}
                  type="button"
                  className="text-base text-qgray px-2"
                >
                  –
                </button>

                <input
                  type="number"
                  min={1}
                  value={inputValue}
                  onChange={(e) => {
                    stopPropagation(e);
                    handleManualChange(e);
                  }}
                  onFocus={(e) => {
                    stopPropagation(e);
                    handleFocus(e);
                  }}
                  onBlur={(e) => {
                    stopPropagation(e);
                    handleBlur();
                  }}
                  onClick={stopPropagation}
                  className="w-14 text-center border-none outline-none text-qblack"
                />

                <button
                  onClick={(e) => {
                    stopPropagation(e);
                    increment();
                  }}
                  type="button"
                  className="text-base text-qgray"
                >
                  +
                </button>
              </div>
            </div>
          </div>
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
