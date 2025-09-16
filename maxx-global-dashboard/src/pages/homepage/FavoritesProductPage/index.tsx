import { useEffect, useMemo, useState } from "react";
import Layout from "../Partials/Layout";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import type { PageRequest, PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import { listProducts } from "../../../services/products/list";
import "../../../theme.css";
import "../../../assets/homepage.css";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";

const crumbs: Crumb[] = [
  { name: "home", path: "/homepage" },
  { name: "Favoriler", path: "/homepage/favorites" },
];

export default function FavoritesProductPage() {
  // 🔒 tri-state: null = henüz yüklenmedi
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ⏱️ opsiyonel min loader süresi
  const MIN_LOADER_TIME = 800;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const start = Date.now();

    (async () => {
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
        setProducts(onlyFavs); // ✅ önce veri gelsin
      } catch (e: any) {
        if (e?.name !== "AbortError" && e?.code !== "ERR_CANCELED") {
          console.error(e);
          setError(e?.message || "Favori ürünler getirilemedi");
          setProducts([]); // ✅ yüklendi ama boş/hatalı durumu
        }
      } finally {
        // ✅ sonra min süreyi bekleyip ready=true yap
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
        setTimeout(() => setReady(true), remaining);
      }
    })();

    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(() => products ?? [], [products]);

  // 🔑 Veri gelmeden veya min süre dolmadan loader dışına çıkma
  if (!ready || products === null) {
    return (
      <Layout>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="title-area w-full">
          <PageTitle title="Favori Ürünler" breadcrumb={crumbs} />
        </div>

        <div className="container-x mx-auto mt-10">
          {error && (
            <div className="mb-6 p-4 rounded bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 🟡 Boş mesaj sadece veri YÜKLENDİKTEN sonra */}
          {!error && visibleProducts.length === 0 && (
            <div className="mb-6 p-4 rounded bg-yellow-50 text-yellow-700 text-sm">
              Henüz favori ürününüz bulunmamaktadır.
            </div>
          )}

          {!error && visibleProducts.length > 0 && (
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
