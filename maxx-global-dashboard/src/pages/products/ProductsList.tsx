import React from "react";
import { useEffect, useState } from "react";
import CategorySidebar from "../products/components/CategorySidebar";
import ProductsGrid from "../products/components/Grid";
import type { PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";
import { listProducts } from "../../services/products/list";
import { getCategorySummaries } from "../../services/categories/summaries";
import { listAllCategories } from "../../services/categories/listAll";
import {
  buildCategoryTree,
  type CatNode,
} from "../../services/categories/buildTree";

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
  const [cats, setCats] = useState<CatNode[]>([]);
  const [tree, setTree] = useState<CatNode[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"top" | "popular" | "newest">("top");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(12);
  const [data, setData] = React.useState<PageResponse<ProductRow>>(
    makeDefaultPage<ProductRow>(size)
  );
  const [loading, setLoading] = React.useState<boolean>(true);

  // Kategorileri yükle
  async function loadCategories(signal?: AbortSignal) {
    try {
      setLoading(true);
      setError(null);
      const flat = await listAllCategories({ signal });
      const tree = buildCategoryTree(flat); // 🔹 Hiyerarşik kategori ağacı
      setCats(tree);
    } catch (err: any) {
      console.error(err);
      setError("Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
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
    <div className="row product-list">
      {/* Sol Menü - Kategoriler */}
      <div className="col-xxl-3 col-lg-4 col-12">
        <CategorySidebar
          items={cats}
          selectedId={selectedCat}
          onSelect={(c) => {
            setSelectedCat(c ? c.id : null);
            setPage(0);
          }}
        />
      </div>

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
          </div>

          {/* Sıralama */}
          <div className="sherah-breadcrumb__right--second">
            <a href="/product-add" className="sherah-btn sherah-gbcolor">
              Ürün Ekle
            </a>
          </div>
        </div>

        {/* Ürünler Grid */}
        {loading && !data ? (
          <div className="text-muted">Yükleniyor…</div>
        ) : data && data.content.length > 0 ? (
          <ProductsGrid data={data} />
        ) : (
          <div className="text-danger">Yükleniyor…</div>
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
