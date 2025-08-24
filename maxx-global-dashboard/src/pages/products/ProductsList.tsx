import React from "react";
import CategorySidebar from "../products/components/CategorySidebar";
import ProductsGrid from "../products/components/Grid";
import type { PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";
import { listProducts } from "../../services/products/list";
import { getCategorySummaries } from "../../services/categories/summaries";
import { listAllCategories } from "../../services/categories/listAll";

type CategoryItem = { id: number | string; name: string; count?: number };

// Sayfalama için varsayılan boş model
function makeDefaultPage<T>(size: number): PageResponse<T> {
  return {
    content: [],
    number: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0,
  } as PageResponse<T>;
}

export default function ProductList() {
  const [cats, setCats] = React.useState<CategoryItem[]>([]);
  const [selectedCat, setSelectedCat] = React.useState<number | string | null>(
    null
  );
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"top" | "popular" | "newest">("top");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(12);
  const [data, setData] = React.useState<PageResponse<ProductRow>>(
    makeDefaultPage<ProductRow>(size)
  );
  const [loading, setLoading] = React.useState<boolean>(true);

  // Kategorileri yükle
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r: any = await getCategorySummaries();
        const arr = Array.isArray(r) ? r : r?.content ?? r?.items ?? [];
        const items: CategoryItem[] = arr.map((x: any) => ({
          id: x.id ?? x.categoryId,
          name: x.name ?? x.categoryName,
          count: x.count ?? x.total ?? x.productCount ?? 0,
        }));
        if (mounted) setCats(items);
      } catch {
        try {
          const flat: any[] = await listAllCategories();
          if (mounted)
            setCats(flat.map((c: any) => ({ id: c.id, name: c.name })));
        } catch (e2) {
          console.error("Kategori yüklenemedi:", e2);
          if (mounted) setCats([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Ürünleri yükle
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);

    listProducts({
      page,
      size,
      sortBy: sort === "newest" ? "createdAt" : "name",
      sortDirection: sort === "newest" ? "desc" : "asc",
    })
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((e) => {
        console.error("Ürünler yüklenemedi:", e);
        if (!mounted) return;
        setData(makeDefaultPage<ProductRow>(size));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [page, size, sort, selectedCat, q]);

  const showingFrom =
    data && data.totalElements > 0 ? data.number * data.size + 1 : 0;
  const showingTo =
    data && data.totalElements > 0
      ? Math.min((data.number + 1) * data.size, data.totalElements)
      : 0;

  return (
    <div className="row">
      {/* Sol Menü - Kategoriler */}
      <CategorySidebar
        items={cats}
        selectedId={selectedCat}
        onSelect={(c) => {
          setSelectedCat(c ? c.id : null);
          setPage(0);
        }}
      />

      {/* Sağ taraf - Ürün listesi */}
      <div className="col-xxl-9 col-lg-8 col-12">
        <div className="sherah-breadcrumb__right mg-top-30">
          <div className="sherah-breadcrumb__right--first">
            {/* Arama Alanı */}
            <div className="sherah-header__form sherah-header__form--product">
              <form
                className="sherah-header__form-inner"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(0);
                }}
              >
                <button
                  className="search-btn"
                  type="submit"
                  aria-label="Search"
                >
                  🔍
                </button>
                <input
                  name="s"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="Search"
                />
              </form>
            </div>
            {data && (
              <p>
                Showing {showingFrom}–{showingTo} of {data.totalElements}{" "}
                results
              </p>
            )}
          </div>

          {/* Sıralama */}
          <div className="sherah-breadcrumb__right--second">
            <div className="sherah-product__nav list-group" role="tablist">
              <button
                className={`list-group-item ${sort === "top" ? "active" : ""}`}
                onClick={() => {
                  setSort("top");
                  setPage(0);
                }}
              >
                Top Rated
              </button>
              <button
                className={`list-group-item ${
                  sort === "popular" ? "active" : ""
                }`}
                onClick={() => {
                  setSort("popular");
                  setPage(0);
                }}
              >
                Popular
              </button>
              <button
                className={`list-group-item ${
                  sort === "newest" ? "active" : ""
                }`}
                onClick={() => {
                  setSort("newest");
                  setPage(0);
                }}
              >
                Newest
              </button>
            </div>
            <a href="/products/new" className="sherah-btn sherah-gbcolor">
              Upload Product
            </a>
          </div>
        </div>

        {/* Ürünler Grid */}
        {loading && !data ? (
          <div className="text-muted">Yükleniyor…</div>
        ) : data && data.content.length > 0 ? (
          <ProductsGrid data={data} />
        ) : (
          <div className="text-danger">Hiç ürün bulunamadı.</div>
        )}

        {/* Sayfalama */}
        {data && data.totalPages > 1 && (
          <div className="row mg-top-40">
            <div className="sherah-pagination">
              <ul className="sherah-pagination__list">
                <li className="sherah-pagination__button">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                </li>

                {Array.from({ length: data.totalPages })
                  .slice(Math.max(0, page - 2), page + 3)
                  .map((_, i) => {
                    const idx = Math.max(0, page - 2) + i;
                    return (
                      <li key={idx} className={idx === page ? "active" : ""}>
                        <button onClick={() => setPage(idx)}>
                          {(idx + 1).toString().padStart(2, "0")}
                        </button>
                      </li>
                    );
                  })}

                <li className="sherah-pagination__button">
                  <button
                    disabled={page >= data.totalPages - 1}
                    onClick={() =>
                      setPage((p) =>
                        Math.min((data.totalPages ?? 1) - 1, p + 1)
                      )
                    }
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
