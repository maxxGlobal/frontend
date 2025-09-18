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
import { listMaterials } from "../../../services/products/listMaterials";
import { listProductsBySearch } from "../../../services/products/search";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../assets/homepage.css";

export default function AllProductPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const size = 12;
  const [totalPages, setTotalPages] = useState(0);

  const [materials, setMaterials] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const [sp] = useSearchParams();
  const catParam = sp.get("cat");
  const searchQuery = sp.get("search");
  const selectedCatId = catParam && catParam !== "0" ? Number(catParam) : null;

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        const data = await listMaterials(c.signal);
        setMaterials(data);
      } catch (e: any) {
        if (e.code !== "ERR_CANCELED") {
          console.error("Malzeme listesi alınamadı", e);
        }
      }
    })();
    return () => c.abort();
  }, []);

  /** Ürünleri çek */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setError(null);
      setLoading(true);
      setProducts(null);

      try {
        const req: PageRequest & { isActive: boolean } = {
          page,
          size,
          sortBy: "name",
          sortDirection: "asc",
          isActive: true,
        };

        let pageRes: PageResponse<Product>;
        if (searchQuery && searchQuery.trim() !== "") {
          // 🔎 Arama yapılmışsa search endpointini kullan
          pageRes = await listProductsBySearch(searchQuery, req, {
            signal: controller.signal,
          });
        } else if (selectedCatId) {
          // Kategori seçilmişse kategoriye göre listele
          pageRes = await listProductsByCategory(selectedCatId, {
            ...req,
            signal: controller.signal,
          });
        } else {
          // Normal tüm ürünler
          pageRes = await listProducts(req, { signal: controller.signal });
        }

        setProducts(pageRes.content ?? []);
        setTotalPages(pageRes.totalPages ?? 0);
      } catch (e: any) {
        if (e.code !== "ERR_CANCELED") {
          console.error(e);
          setError("Ürünler getirilemedi");
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selectedCatId, page, searchQuery]);

  /** Filtreleme */
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
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleMaterial = (mat: string) => {
    setPage(0);
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

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
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-3 py-2 bg-qh2-green rounded text-white disabled:opacity-50"
                      >
                        Önceki
                      </button>
                      <span className="text-sm text-qblack">
                        Sayfa <span className="text-qh2-green">{page + 1}</span>{" "}
                        / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page + 1 >= totalPages}
                        className="px-3 py-2 bg-qh2-green rounded text-white disabled:opacity-50"
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
