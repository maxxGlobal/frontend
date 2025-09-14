// src/pages/Helpers/Cards/ProductCardStyleOne.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import ThinLove from "../icons/ThinLove";
import { addFavorite } from "../../../../services/favorites/add";
import { removeFavorite } from "../../../../services/favorites/remove";
import type { Product, ProductRow } from "../../../../types/product";
import { addToCart } from "../../../../services/cart/storage";

type Props = {
  datas: Product;
  /** Üst sayfadan gelen seçili malzemeler */
  filterMaterials?: string[];
};

const PUBLIC_FALLBACK = `${
  import.meta.env.VITE_PUBLIC_URL ?? ""
}/assets/images/placeholder.png`;
function buildImageUrl(u?: string | null) {
  if (!u || u.trim() === "") return PUBLIC_FALLBACK;
  return u;
}

/** Ürün seçili malzemelerden en az biriyle eşleşiyor mu? */
function matchesMaterials(prod: Product, selected: string[] = []) {
  if (!selected.length) return true; // malzeme seçilmediyse tüm ürünler geçsin

  // Üründeki malzeme bilgisini olabildiğince esnek yakala:
  //  - prod.materials: string[]
  //  - prod.material: string
  //  - prod.attributes?.materials: string[]
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
  // 1) Status kontrolü
  if (datas.status !== "AKTİF") return null;

  if (!matchesMaterials(datas, filterMaterials)) return null;

  const qc = useQueryClient();
  const d = datas;
  const [isFav, setIsFav] = useState<boolean>(!!d.isFavorite);
  const [quantity, setQuantity] = useState<number>(0);

  const increment = () => setQuantity((p) => p + 1);
  const decrement = () => setQuantity((p) => (p > 1 ? p - 1 : 1));
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(d.id, quantity);
    Swal.fire({
      icon: "success",
      title: "Sepete eklendi",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  async function handleFavorite() {
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
      console.error(e);
      setIsFav((prev) => !prev);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Favori işlemi başarısız",
      });
    }
  }

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden rounded-[8px]"
      style={{ boxShadow: "0px 15px 64px rgba(0,0,0,0.05)" }}
    >
      <div
        className="product-card-img w-full h-[300px] bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${buildImageUrl(d.primaryImageUrl)})` }}
      />

      <div className="product-card-details px-[30px] pb-[30px] relative">
        <Link to={`/homepage/product/${d.id}`}>
          <p className="title my-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {d.name}
          </p>
        </Link>

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

        {/* Fiyatlar */}
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

        {/* Sepet butonu + adet inputu */}
        <div className="absolute flex w-[234px] h-[54px] left-1/2 -translate-x-1/2 -bottom-20 group-hover:bottom-[20px] transition-all">
          <button
            type="button"
            onClick={handleAddToCart}
            className="yellow-btn w-full h-full cursor-pointer"
          >
            Sepete Ekle
          </button>
          <div className="w-[130px] h-full px-[10px] flex items-center border bg-white border-qgray-border">
            <div className="flex justify-between items-center w-full">
              <button
                onClick={decrement}
                type="button"
                className="text-base text-qgray px-2"
              >
                –
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={handleManualChange}
                className="w-14 text-center border-none outline-none text-qblack"
              />
              <button
                onClick={increment}
                type="button"
                className="text-base text-qgray"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Butonları */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-2 transition-all duration-300">
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
