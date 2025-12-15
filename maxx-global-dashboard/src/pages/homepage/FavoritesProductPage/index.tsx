import { useEffect, useMemo, useState } from "react";
import Layout from "../Partials/Layout";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import type { PageRequest, PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import { listProducts } from "../../../services/products/list";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { useTranslation } from "react-i18next";

export default function FavoritesProductPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const MIN_LOADER_TIME = 800;
  const [ready, setReady] = useState(false);

  const crumbs: Crumb[] = useMemo(
    () => [
      { name: t("pages.favorites.breadcrumbHome"), path: "/homepage" },
      { name: t("pages.favorites.pageTitle"), path: "/homepage/favorites" },
    ],
    [t]
  );

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
        setProducts(onlyFavs);
      } catch (e: any) {
        if (e?.name !== "AbortError" && e?.code !== "ERR_CANCELED") {
          setError(e?.message || t("pages.favorites.loadError"));
          setProducts([]);
        }
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
        setTimeout(() => setReady(true), remaining);
      }
    })();

    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(() => products ?? [], [products]);
  if (!ready || products === null) {
    return (
      <Layout>
        <Helmet>
          <title>{t("pages.favorites.metaTitle")}</title>
          <meta
            name="description"
            content={t("pages.favorites.metaDescription") ?? ""}
          />
        </Helmet>
        <div className="flex justify-center items-center w-full h-[70vh]">
          <LoaderStyleOne />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{t("pages.favorites.metaTitle")}</title>
        <meta
          name="description"
          content={t("pages.favorites.metaDescription") ?? ""}
        />
      </Helmet>
      <div className="products-page-wrapper w-full">
        <div className="title-area w-full">
          <PageTitle title={t("pages.favorites.pageTitle")} breadcrumb={crumbs} />
        </div>

        <div className="container-x mx-auto mt-10">
          {error && (
            <div className="mb-6 p-4 rounded bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          {!error && visibleProducts.length === 0 && (
            <div className="mb-6 p-4 rounded bg-yellow-50 text-yellow-700 text-sm">
              {t("pages.favorites.empty")}
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
