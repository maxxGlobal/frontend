// src/pages/SectionStyleThreeHomeTwo.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

import ViewMoreTitle from "./ViewMoreTitle";
import ThinLove from "./icons/ThinLove";

import { listPopularProducts } from "../../../services/products/popular";
import { addFavorite } from "../../../services/favorites/add";
import { removeFavorite } from "../../../services/favorites/remove";
import type { ProductRow } from "../../../types/product";
 
type BannerProps = {
  className?: string;
  showProducts?: number;
  sectionTitle?: string;
  seeMoreUrl?: string;
};

export default function SectionStyleThreeHomeTwo({
  className,
  showProducts = 3,
  sectionTitle,
  seeMoreUrl,
}: BannerProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const qc = useQueryClient();
  const { t, i18n } = useTranslation();
  const resolvedTitle = useMemo(
    () => sectionTitle ?? t("pages.homeTwo.popularTitle"),
    [sectionTitle, t]
  );
 
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setHasError(false);
        const data = await listPopularProducts(showProducts, 30);
        setProducts(data);
        const q: Record<number, number> = {};
        const iv: Record<number, string> = {};
        const fav: Record<number, boolean> = {};
        data.forEach((p) => {
          q[p.id] = 1;
          iv[p.id] = "1";
          fav[p.id] = !!p.isFavorite;
        });
         setFavorites(fav);
      } catch (e) {
        console.error("Popüler ürünler getirilemedi:", e);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [showProducts, i18n.language]);
 

  async function handleFavorite(id: number) {
    try {
      if (favorites[id]) {
        setFavorites((p) => ({ ...p, [id]: false }));
        await removeFavorite(id);
      } else {
        setFavorites((p) => ({ ...p, [id]: true }));
        await addFavorite({ productId: id });
      }
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      setFavorites((p) => ({ ...p, [id]: !p[id] }));
      Swal.fire({
        icon: "error",
        title: t("pages.homeTwo.popular.favoritesErrorTitle"),
        text: t("pages.homeTwo.popular.favoritesErrorText"),
      });
    }
  }

  return (
    <div className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle={resolvedTitle} seeMoreUrl={seeMoreUrl}>
        <div className="products-section w-full mt-10">
          {loading && (
            <p className="text-center py-6">
              {t("pages.homeTwo.popular.loading")}
            </p>
          )}
          {hasError && (
            <p className="text-center py-6 text-red-500">
              {t("pages.homeTwo.popular.loadError")}
            </p>
          )}

          {!loading && !hasError && products.length > 0 && (
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10">
              {products.map((p) => (
                <div key={p.id} className="item" data-aos="fade-up">
                  <div
                    className="product-card-style-one-two rounded-xl w-full h-full bg-white relative group overflow-hidden"
                    style={{ boxShadow: "0px 15px 64px 0px rgba(0,0,0,0.05)" }}
                  >
                    <div
                      className="product-card-img w-full h-[322px] mt-4 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage: `url(${ 
                          p.primaryImageUrl || "/assets/image/resim-yok.jpg"
                        })`,
                      }}
                    />
                    <div className="product-card-details flex justify-center h-[150px] items-center relative px-4">
                       

                      <div className="text-center">
                        <Link to={`/homepage/product/${p.id}`}>
                          <p className="title mb-2 text-[20px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
                            {p.name}
                          </p>
                        </Link>
                        {p.categoryName && (
                          <p className="text-xs text-gray-500 mb-1">
                            {p.categoryName}
                          </p>
                        )}
                        {p.stockQuantity != null && (
                          <p className="text-xs text-gray-500 mb-1">
                            {t("pages.homeTwo.banner.stock", {
                              count: p.stockQuantity,
                              unit: p.unit ?? "",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-[8px] -right-[50px] top-2 transition-all duration-300 ease-in-out">
                      <button
                        type="button"
                        onClick={() => handleFavorite(p.id)}
                        className="w-10 h-10 flex justify-center items-center bg-primarygray rounded"
                      >
                        <ThinLove
                          fillColor={favorites[p.id] ? "red" : "white"}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ViewMoreTitle>
    </div>
  );
}
