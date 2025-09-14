// src/pages/FavoritesProductPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import Layout from "../Partials/Layout";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import type { PageRequest, PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";
import { listProducts } from "../../../services/products/list";
import "../../../theme.css";
import "../../../assets/homepage.css";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";

export default function FavoritesProductPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setError(null);
      setLoading(true);
      setProducts(null);

      try {
        const req: PageRequest & { isFavorite?: boolean } = {
          page: 0,
          size: 99999,
          sortBy: "name",
          sortDirection: "asc",
          isFavorite: true,
        };

        const pageRes: PageResponse<ProductRow> = await listProducts(req, {
          signal: controller.signal,
        });

        const onlyFavs = (pageRes.content ?? []).filter((p) => p.isFavorite);
        setProducts(onlyFavs);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError(e?.message || "Favori ürünler getirilemedi");
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(() => products ?? [], [products]);

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <h1 className="text-xl font-bold mb-6">Favori Ürünlerim</h1>

          {loading && !error && (
            <div className="mb-6 p-4 rounded bg-gray-50 text-gray-600 text-sm">
              <LoaderStyleOne />
            </div>
          )}

          {!loading && !error && visibleProducts.length === 0 && (
            <div className="mb-6 p-4 rounded bg-yellow-50 text-yellow-700 text-sm">
              Henüz favori ürününüz bulunmamaktadır.
            </div>
          )}

          {visibleProducts.length > 0 && (
            <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
              {visibleProducts.map((p) => (
                <ProductCardStyleOne key={p.id} datas={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
