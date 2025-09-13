// src/pages/AllProductPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import Layout from "../Partials/Layout";
import CategoriesSidebar from "./CategoriesSidebar";

import type { PageRequest, PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";

import { listProducts } from "../../../services/products/list";
import { listProductsByCategory } from "../../../services/products/listByCategory";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function AllProductPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sp] = useSearchParams();
  const catParam = sp.get("cat");
  const selectedCatId = catParam && catParam !== "0" ? Number(catParam) : null;

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setError(null);
      setLoading(true);
      setProducts(null);

      try {
        const req: PageRequest = {
          page: 0,
          size: 99990,
          sortBy: "name",
          sortDirection: "asc",
        };

        let pageRes: PageResponse<ProductRow>;
        if (selectedCatId) {
          pageRes = await listProductsByCategory(selectedCatId, {
            signal: controller.signal,
          });
        } else {
          pageRes = await listProducts(req, { signal: controller.signal });
        }

        setProducts(pageRes?.content ?? []);
      } catch (e: any) {
        const msg = String(e?.message || "").toLowerCase();
        const isAbort =
          e?.name === "AbortError" ||
          e?.code === "ERR_CANCELED" ||
          msg.includes("abort") ||
          msg.includes("canceled");
        if (!isAbort) {
          console.error(e);
          setError(e?.message || "Ürünler getirilemedi");

          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedCatId]);

  const visibleProducts = useMemo(() => products ?? [], [products]);

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full lg:flex lg:space-x-[30px]">
            {/* SOL SİDEBAR */}
            <div className="lg:w-[270px]">
              <CategoriesSidebar />
              <div className="w-full hidden lg:block h-[295px]">
                <img
                  src={`${
                    import.meta.env.VITE_PUBLIC_URL
                  }/assets/images/bannera-5.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* SAĞ İÇERİK */}
            <div className="flex-1">
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px]">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Gösteriliyor</span>{" "}
                    {loading || products === null
                      ? "…"
                      : ` ${visibleProducts.length} `}
                    adet
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {(loading || products === null) && !error && (
                <div className="mb-6 p-4 rounded bg-gray-50 text-gray-600 text-sm">
                  Ürünler yükleniyor…
                </div>
              )}

              {/* Boş mesaj: sadece sonuç GERÇEKTEN geldiyse ve 0 ise */}
              {!loading &&
                products !== null &&
                !error &&
                visibleProducts.length === 0 && (
                  <div className="mb-6 p-4 rounded bg-yellow-50 text-yellow-700 text-sm">
                    Bu kategoride ürün bulunamadı.
                  </div>
                )}

              {/* GRID */}
              {products !== null && visibleProducts.length > 0 && (
                <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                  {visibleProducts.map((p) => {
                    console.log("Visible product:", p);
                    return <ProductCardStyleOne key={p.id} datas={p} />;
                  })}
                </div>
              )}

              {/* Banner */}
              <div className="w-full h-[164px] overflow-hidden mb-[40px]">
                <img
                  src={`${
                    import.meta.env.VITE_PUBLIC_URL
                  }/assets/images/bannera-6.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
