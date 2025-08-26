import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import CategorySidebar from "../products/components/CategorySidebar";
import EditProductModal from "../products/components/EditProductModal";
import DeleteProductModal from "../products/components/DeleteProductModal";
import ProductsGrid from "../products/components/Grid";

import type { PageResponse } from "../../types/paging";
import type { ProductRow, Product } from "../../types/product";

import { listProducts } from "../../services/products/list";
import { listProductsByCategory } from "../../services/products/listByCategory";
import { listProductsBySearch } from "../../services/products/search";
import { listAllCategories } from "../../services/categories/listAll";

import {
  buildCategoryTree,
  type CatNode,
} from "../../services/categories/buildTree";

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
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"top" | "popular" | "newest">("top");
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [data, setData] = useState<PageResponse<ProductRow>>(
    makeDefaultPage<ProductRow>(size)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const [categories, setCategories] = useState<
    { id: number; name?: string; label?: string }[]
  >([]);
  const navigate = useNavigate();

  const categoriesMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const c of categories) {
      const name = String(c.name ?? c.label ?? "");
      if (c.id != null && name) m[c.id] = name;
    }
    return m;
  }, [categories]);

  async function loadCategories(signal?: AbortSignal) {
    try {
      const flat = await listAllCategories({ signal });
      const tree = buildCategoryTree(flat);
      setCats(tree);
      setCategories(flat);
    } catch (err) {
      console.error(err);
      setError("Kategoriler yüklenemedi.");
    }
  }

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        let res;
        if (q && q.trim() !== "") {
          res = await listProductsBySearch(
            q.trim(),
            {
              page,
              size,
              sortBy: sort === "newest" ? "createdAt" : "name",
              sortDirection: sort === "newest" ? "desc" : "asc",
            },
            { signal }
          );
        } else if (selectedCat) {
          res = await listProductsByCategory(selectedCat, { signal });
        } else {
          res = await listProducts(
            {
              page,
              size,
              sortBy: sort === "newest" ? "createdAt" : "name",
              sortDirection: sort === "newest" ? "desc" : "asc",
            },
            { signal }
          );
        }
        setData(res);
      } catch (e) {
        console.error("Ürünler yüklenemedi:", e);
        setData(makeDefaultPage<ProductRow>(size));
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [q, page, size, sort, selectedCat]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Güncel ürünü listeye uygula (FETCH YOK! — optimistic keep)
  const patchRowWithUpdated = (updated: Product) => {
    const movedOut =
      selectedCat && updated.categoryId && selectedCat !== updated.categoryId;

    const catName =
      updated.categoryName ??
      (updated.categoryId != null
        ? categoriesMap[updated.categoryId]
        : undefined) ??
      null;

    setData((prev) => {
      let content = prev.content.map((row) => {
        if (row.id !== updated.id) return row;
        const patched: ProductRow = {
          ...row,
          id: updated.id,
          name: updated.name,
          code: updated.code,
          description: updated.description,
          categoryId: updated.categoryId,
          categoryName: catName,
          stockQuantity: updated.stockQuantity,
          unit: updated.unit,
          isActive: updated.isActive,
          isInStock: updated.isInStock,
          primaryImageUrl: updated.primaryImageUrl ?? row.primaryImageUrl,
        };
        return patched;
      });

      if (movedOut) {
        content = content.filter((r) => r.id !== updated.id);
      }
      return { ...prev, content };
    });
  };

  return (
    <div className="row product-list">
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

      <div className="col-xxl-9 col-lg-8 col-12">
        <div className="sherah-breadcrumb__right mg-top-30">
          <div className="sherah-breadcrumb__right--first">
            <div className="input-group input-group-sm filter-search flex-nowrap mt-2 sherah-border">
              <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
              <input
                type="search"
                className="form-control sherah-wc__form-input"
                placeholder="Ürün adı / kodu ara…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button className="btn btn-clear" onClick={() => setQ("")}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          <div className="sherah-breadcrumb__right--second">
            <a href="/product-add" className="sherah-btn sherah-gbcolor">
              Ürün Ekle
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor</span>
            </div>
          </div>
        ) : data && data.content.length > 0 ? (
          <ProductsGrid
            data={data}
            canManage={true}
            onView={(product) => navigate(`/products/${product.id}`)}
            onImages={(product) => navigate(`/products/${product.id}/images`)}
            onEdit={(product) => setEditing(product)}
            onAskDelete={(product) => setDeleting(product)}
            categoriesMap={categoriesMap}
          />
        ) : (
          !initialLoad && (
            <div className="alert alert-primary" role="alert">
              Ürün Bulunamadı. Lütfen doğru ürünü aradığınıza emin olun.
            </div>
          )
        )}

        {/* Sayfalama (aynı) */}
        <div className="row align-items-center mt-3">
          <div className="col-sm-12 col-md-5">
            Toplam <strong>{data.totalElements}</strong> kayıt • Sayfa{" "}
            {data.number + 1} / {data.totalPages}
          </div>
          <div className="col-sm-12 col-md-7">
            <div className="dataTables_paginate paging_simple_numbers">
              <ul className="pagination">
                <li
                  className={`paginate_button page-item previous ${
                    data.first ? "disabled" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!data.first) setPage((p) => Math.max(0, p - 1));
                    }}
                  >
                    <i className="fas fa-angle-left" />
                  </a>
                </li>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`paginate_button page-item ${
                      i === data.number ? "active" : ""
                    }`}
                  >
                    <a
                      href="#"
                      className="page-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i);
                      }}
                    >
                      {i + 1}
                    </a>
                  </li>
                ))}
                <li
                  className={`paginate_button page-item next ${
                    data.last ? "disabled" : ""
                  }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!data.last)
                        setPage((p) => Math.min(data.totalPages - 1, p + 1));
                    }}
                  >
                    <i className="fas fa-angle-right" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {editing && (
          <EditProductModal
            productId={editing.id}
            categories={categories}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              if (updated) patchRowWithUpdated(updated);
              setEditing(null);
            }}
          />
        )}

        {deleting && (
          <DeleteProductModal
            target={deleting}
            onCancel={() => setDeleting(null)}
            onConfirm={async () => {
              try {
                const response = await fetch(
                  `http://localhost:8080/api/products/${deleting.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.message || "Silme başarısız");
                }
                alert("Ürün başarıyla silindi!");
                fetchProducts(); // silmede tam refresh mantıklı
              } catch (e: any) {
                alert(e.message);
              } finally {
                setDeleting(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
