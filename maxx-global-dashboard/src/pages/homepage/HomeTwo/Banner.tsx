import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRandomProducts } from "../../../services/products/random";
import type { ProductRow } from "../../../types/product";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { useTranslation } from "react-i18next";

type BannerProps = {
  className?: string;
};

export default function Banner({ className }: BannerProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setHasError(false);
        const data = await listRandomProducts(2);
        setProducts(data);
      } catch (e: any) {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        <div className="main-wrapper w-full pt-[30px]">
          <div className="banner-card xl:flex xl:space-x-[30px] xl:h-[600px] mb-[30px]">
            {loading && (
              <div className="w-full text-center py-10">
                <LoaderStyleOne />
              </div>
            )}
            {hasError && (
              <div className="w-full text-center py-10 text-red-500">
                {t("pages.homeTwo.banner.loadError")}
              </div>
            )}

            {!loading && !hasError && products.length > 0 && (
              <>
                <div
                  data-aos="fade-right"
                  className="xl:w-1/2 w-full h-[600px] bg-white rounded-xl relative rounded-md overflow-hidden"
                >
                  <img
                    src={
                      products[0].primaryImageUrl ??
                      "src/assets/img/resim-yok.jpg"
                    }
                    alt={products[0].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 h-auto w-full bg-black/30 flex flex-col justify-center p-10 text-white">
                    <span className="inline-block w-max text-xs font-semibold bg-white/70 text-gray-900 px-3 py-1 rounded-full mb-4">
                      {products[0].categoryName}
                    </span>
                    <h2 className="text-3xl font-bold text-dark">
                      {products[0].name}
                    </h2>
                    <p className="text-sm text-gray-200 my-4">
                      {t("pages.homeTwo.banner.stock", {
                        count: products[0].stockQuantity,
                        unit: products[0].unit ?? "",
                      })}
                    </p>
                    <Link
                      to={`/homepage/product/${products[0].id}`}
                      className="inline-block bg-qyellow text-white px-5 py-2 rounded hover:bg-qh2-green transition w-fit"
                    >
                      {t("pages.homeTwo.banner.viewDetails")}
                    </Link>
                  </div>
                </div>

                {/* Sağ taraf (2 ürün) */}
                <div
                  data-aos="fade-left"
                  className="xl:w-1/2 w-full h-[600px] bg-white rounded-xl relative rounded-md overflow-hidden lg:mt-0 mt-5"
                >
                  {products.slice(1, 3).map((p) => (
                    <div
                      key={p.id}
                      className="relative w-full h-full rounded-md overflow-hidden"
                    >
                      <img
                        src={
                          p.primaryImageUrl ?? "src/assets/img/resim-yok.jpg"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute w-full bg-black/30 bottom-0 h-auto flex flex-col justify-center p-10 text-white">
                        <span className="inline-block w-max text-xs font-semibold bg-white/70 text-gray-900 px-3 py-1 rounded-full mb-4">
                          {p.categoryName}
                        </span>

                        <h2 className="text-3xl font-bold text-dark">
                          {p.name}
                        </h2>
                        <p className="text-sm text-gray-200 my-4">
                          {t("pages.homeTwo.banner.stock", {
                            count: p.stockQuantity,
                            unit: p.unit ?? "",
                          })}
                        </p>
                        <Link
                          to={`/homepage/product/${p.id}`}
                          className="inline-block bg-qh2-green text-white px-4 py-2 rounded hover:bg-qyellow transition w-fit"
                        >
                          {t("pages.homeTwo.banner.viewDetails")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
