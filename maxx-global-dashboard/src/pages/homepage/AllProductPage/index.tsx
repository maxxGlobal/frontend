import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import Layout from "../Partials/Layout";
import CategoriesSidebar from "./CategoriesSidebar";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import type { PageRequest, PageResponse } from "../../../types/paging";
import type { Product } from "../../../types/product";
import { listProducts } from "../../../services/products/list";
import { listProductsByCategory } from "../../../services/products/listByCategory";
import { listProductsBySearch } from "../../../services/products/search";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";

export default function AllProductPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMaterials] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den parametreleri al
  const catParam = searchParams.get("cat");
  const searchQuery = searchParams.get("search");
  const pageParam = searchParams.get("page");

  const selectedCatId = catParam && catParam !== "0" ? Number(catParam) : null;
  const currentPage = pageParam ? Math.max(0, Number(pageParam) - 1) : 0; // URL'de 1-based, kod'da 0-based

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true; // Component mount durumunu takip et

    (async () => {
      if (!isMounted) return; // Component unmount olduysa çık

      setError(null);
      setLoading(true);
      setProducts(null);

      try {
        const req: PageRequest & { isActive: boolean } = {
          page: currentPage,
          size,
          sortBy: "name",
          sortDirection: "asc",
          isActive: true,
        };

        let pageRes: PageResponse<Product>;
        if (searchQuery && searchQuery.trim() !== "") {
          pageRes = await listProductsBySearch(searchQuery, req, {
            signal: controller.signal,
          });
        } else if (selectedCatId) {
          pageRes = await listProductsByCategory(selectedCatId, {
            ...req,
            signal: controller.signal,
          });
        } else {
          pageRes = await listProducts(req, { signal: controller.signal });
        }

        if (isMounted && !controller.signal.aborted) {
          setProducts(pageRes.content ?? []);
          setTotalPages(pageRes.totalPages ?? 0);
        }
      } catch (e: any) {
        if (
          isMounted &&
          e.code !== "ERR_CANCELED" &&
          !controller.signal.aborted
        ) {
          setError("Ürünler getirilemedi");
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCatId, currentPage, searchQuery]);

  const visibleProducts = useMemo(() => {
    const base = (products ?? []).filter((p) => p.status === "AKTİF");
    if (!selectedMaterials.length) return base;
    return base.filter((p) => {
      const mat = (p.material ?? "").toLowerCase();
      return selectedMaterials.some((m) =>
        mat.toLowerCase().includes(m.toLowerCase())
      );
    });
  }, [products, selectedMaterials]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      // URL'yi güncelle (1-based)
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("page", String(newPage + 1));
      setSearchParams(newSearchParams);

      // Sayfanın en üstüne scroll
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Sayfa değiştiğinde URL'de sayfa numarası yoksa ekle
  useEffect(() => {
    if (!pageParam && (selectedCatId || searchQuery)) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("page", "1");
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [selectedCatId, searchQuery, pageParam, searchParams, setSearchParams]);

  return (
    <Layout>
      <Helmet>
        <title>Medintera – Ürünler</title>
        <meta name="description" content="Ürünler" />
      </Helmet>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full lg:flex lg:space-x-[30px]">
            <div className="lg:w-[270px]">
              <CategoriesSidebar />
            </div>

            <div className="flex-1">
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:justify-between md:items-center p-[30px] mb-[40px]">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Gösteriliyor</span>{" "}
                    {loading || products === null
                      ? "…"
                      : `${visibleProducts.length} / ${totalPages * size} adet`}
                  </p>
                </div>

                {/* Sayfa bilgisi göster */}
                {totalPages > 1 && !loading && (
                  <div className="text-sm text-qgray">
                    Sayfa {currentPage + 1} / {totalPages}
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 rounded bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {(loading || products === null) && !error && (
                <div className="flex justify-center py-10">
                  <LoaderStyleOne />
                </div>
              )}
              {!loading &&
                products !== null &&
                !error &&
                visibleProducts.length === 0 && (
                  <div className="mb-6 p-4 rounded bg-yellow-50 text-yellow-700 text-sm">
                    Seçilen filtreye uygun ürün bulunamadı.
                  </div>
                )}

              {products !== null && visibleProducts.length > 0 && (
                <>
                  <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                    {visibleProducts.map((p) => (
                      <ProductCardStyleOne key={p.id} datas={p} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-3 mb-10">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-qh2-green rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
                      >
                        Önceki
                      </button>

                      {/* Sayfa numaraları */}
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i;
                            } else if (currentPage < 3) {
                              pageNum = i;
                            } else if (currentPage >= totalPages - 3) {
                              pageNum = totalPages - 5 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded text-sm transition-colors ${
                                  pageNum === currentPage
                                    ? "bg-qh2-green text-white"
                                    : "bg-gray-100 text-qblack hover:bg-gray-200"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage + 1 >= totalPages}
                        className="px-4 py-2 bg-qh2-green rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
                      >
                        Sonraki
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
