// src/pages/catalog/ProductList.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CategorySidebar from "../products/components/CategorySidebar";
import EditProductModal from "../products/components/EditProductModal";
import DeleteProductModal from "../products/components/DeleteProductModal";
import ProductsGrid from "../products/components/Grid";

import type { PageResponse, PageRequest } from "../../types/paging";
import type { ProductRow, Product } from "../../types/product";

import { listProducts } from "../../services/products/list";
import { listProductsByCategory } from "../../services/products/listByCategory";
import { listProductsBySearch } from "../../services/products/search";
import { listAllCategories } from "../../services/categories/listAll";
import { deleteProduct } from "../../services/products/delete";
import { restoreProduct } from "../../services/products/restore";
import { listActiveCategories } from "../../services/categories/listActive";

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

type StatusFilter = "ALL" | "AKTİF" | "SİLİNDİ";

// Abort/cancel hatalarını ayırt et
function isAbortError(err: any) {
  return (
    err?.name === "AbortError" ||
    err?.code === "ERR_CANCELED" ||
    String(err?.message || "")
      .toLowerCase()
      .includes("abort") ||
    String(err?.message || "")
      .toLowerCase()
      .includes("canceled")
  );
}

export default function ProductList() {
  const [cats, setCats] = useState<CatNode[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"top" | "popular" | "newest">("top");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [data, setData] = useState<PageResponse<ProductRow>>(
    makeDefaultPage<ProductRow>(size)
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const [categories, setCategories] = useState<
    { id: number; name?: string; label?: string }[]
  >([]);

  const navigate = useNavigate();

  function flattenTreeToOptions(
    nodes: CatNode[],
    depth = 0
  ): { id: number; label: string; name?: string }[] {
    const out: { id: number; label: string; name?: string }[] = [];

    nodes.forEach((n) => {
      const indent = "\u00A0\u00A0".repeat(depth); // boşluk

      let emoji = "";
      if (depth === 0) emoji = "🗂️";
      else if (depth === 1) emoji = "📁";
      else if (depth === 2) emoji = "📂";
      else if (depth === 3) emoji = "📂";
      else if (depth === 4) emoji = "📂";
      else emoji = "↪";

      out.push({
        id: n.id,
        label: `${indent}${emoji} ${n.name}`,
        name: n.name,
      });

      if (n.children?.length) {
        out.push(...flattenTreeToOptions(n.children, depth + 1));
      }
    });

    return out;
  }

  // Kategorileri yükle
  async function loadCategories(signal?: AbortSignal) {
    try {
      const flat = await listAllCategories({ signal });
      const tree = buildCategoryTree(flat);
      setCats(tree);

      // Seviyeli listeyi oluştur
      const leveled = flattenTreeToOptions(tree);
      console.log("Leveled categories:", leveled); // Burada artık ↳ ile göreceksin
      setCategories(leveled);
    } catch (err) {
      if (isAbortError(err)) return;
      console.error("Kategoriler yüklenemedi:", err);
    }
  }

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setListError(null);
      try {
        const baseReq: PageRequest = {
          page,
          size,
          sortBy: sort === "newest" ? "createdAt" : "name",
          sortDirection: sort === "newest" ? "desc" : "asc",
        };

        let res: PageResponse<ProductRow>;
        if (q && q.trim() !== "") {
          res = await listProductsBySearch(q.trim(), baseReq, { signal });
        } else if (selectedCat) {
          res = await listProductsByCategory(selectedCat, { signal });
        } else {
          res = await listProducts(baseReq, { signal });
        }

        // Status filtresi (ALL/Aktif/Silindi)
        let finalRes = res;
        if (statusFilter !== "ALL") {
          // bütün sayfalardaki ürünleri toplamak için
          const allContent: ProductRow[] = [];
          let allPage = 0;

          do {
            const resPage = await listProducts(
              {
                ...baseReq,
                page: allPage,
                size,
              },
              { signal }
            );

            allContent.push(...resPage.content);
            allPage++;
            if (allPage >= resPage.totalPages) break;
          } while (true);

          const filtered = allContent.filter((r) => {
            const st = r.status ?? (r.isActive ? "AKTİF" : "SİLİNDİ");
            return st === statusFilter;
          });

          finalRes = {
            ...res,
            content: filtered.slice(page * size, (page + 1) * size), // sayfalama uygula
            numberOfElements: filtered.length,
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
            first: page === 0,
            last: page >= Math.ceil(filtered.length / size) - 1,
          };
        }

        setData(finalRes);
        setInitialLoad(false);
      } catch (e: any) {
        if (isAbortError(e)) {
          // İptal edilen istek hata sayılmaz; hiçbir şey gösterme
          return;
        }
        console.error(
          "Ürünler yüklenemedi:",
          e?.response?.data ?? e?.message ?? e
        );
        setListError("Ürünler yüklenemedi.");
        // initialLoad'u true bırakıyoruz ki “Ürün Bulunamadı” mesajı görünmesin
      } finally {
        setLoading(false);
      }
    },
    [q, page, size, sort, selectedCat, statusFilter]
  );

  // İlk/bağımlı yüklemeler
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Edit sonrası tek satırı liste üzerinde güncelle (optimistic keep)
  const patchRowWithUpdated = (updated: Product) => {
    const movedOut =
      selectedCat && updated.categoryId && selectedCat !== updated.categoryId;

    const updatedStatus =
      (updated as any).status ?? (updated.isActive ? "AKTİF" : "SİLİNDİ");
    const failsStatusFilter =
      statusFilter !== "ALL" && updatedStatus !== statusFilter;

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
          categoryName: (updated as any).categoryName ?? row.categoryName,
          stockQuantity: updated.stockQuantity,
          unit: updated.unit,
          status: updatedStatus as "AKTİF" | "SİLİNDİ",
          isActive: updatedStatus === "AKTİF",
          isInStock: updated.isInStock,
          primaryImageUrl:
            (updated as any).primaryImageUrl ?? row.primaryImageUrl,
        };
        return patched;
      });

      if (movedOut || failsStatusFilter) {
        content = content.filter((r) => r.id !== updated.id);
      }
      return { ...prev, content };
    });
  };

  // Silme onayı (soft delete → status: SİLİNDİ, isActive: false)
  async function handleDeleteConfirm() {
    if (!deleting) return;
    try {
      await deleteProduct(deleting.id);

      setData((prev): PageResponse<ProductRow> => {
        let content: ProductRow[] = prev.content.map(
          (row): ProductRow =>
            row.id === deleting.id
              ? ({ ...row, isActive: false, status: "SİLİNDİ" } as ProductRow)
              : row
        );

        if (statusFilter === "AKTİF") {
          content = content.filter((r) => r.isActive === true);
        }

        return {
          ...prev,
          content,
          numberOfElements: content.length,
        };
      });
    } catch (e: any) {
      alert(e?.message || "Silme başarısız");
    } finally {
      setDeleting(null);
    }
  }

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
        {/* Üst bar: arama + status filtre + ekle */}
        <div className="sherah-breadcrumb__right mg-top-30 d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="sherah-breadcrumb__right--first d-flex align-items-center gap-2">
            {/* Arama Alanı */}
            <div
              className="input-group input-group-sm filter-search flex-nowrap mt-2 sherah-border"
              style={{ minWidth: 240 }}
            >
              <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
              <input
                type="search"
                className="form-control sherah-wc__form-input"
                placeholder="Ürün adı / kodu ara…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
              />
              {q && (
                <button
                  className="btn btn-clear"
                  onClick={() => {
                    setQ("");
                    setPage(0);
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Durum Filtresi */}
            <select
              className="form-select form-select-sm mt-2 p-2"
              style={{ minWidth: 180, height: 46 }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(0);
              }}
            >
              <option value="ALL">Tümü</option>
              <option value="AKTİF">Aktif</option>
              <option value="SİLİNDİ">Silinen</option>
            </select>
          </div>

          {/* Ürün Ekle Butonu */}
          <div className="sherah-breadcrumb__right--second">
            <a href="/product-add" className="sherah-btn sherah-gbcolor">
              Ürün Ekle
            </a>
          </div>
        </div>

        {/* Grid / Spinner / Mesaj */}
        {loading ? (
          <div className="text-center vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor</span>
            </div>
          </div>
        ) : listError ? (
          <div className="alert alert-danger" role="alert">
            {listError}
          </div>
        ) : data && data.content.length > 0 ? (
          <ProductsGrid
            data={data}
            canManage={true}
            onView={(product) => navigate(`/products/${product.id}`)}
            onImages={(product) => navigate(`/products/${product.id}/images`)}
            onEdit={(product) => setEditing(product)}
            onAskDelete={(product) => setDeleting(product)}
            onRestore={async (row) => {
              try {
                const restored = await restoreProduct(row.id);
                // UI normalizasyon: status "AKTİF" olsun
                const status =
                  (restored as any).status === "ACTIVE"
                    ? "AKTİF"
                    : (restored as any).status;
                setData((prev): PageResponse<ProductRow> => {
                  let content = prev.content.map(
                    (r): ProductRow =>
                      r.id === row.id
                        ? ({
                            ...r,
                            isActive: true,
                            status: "AKTİF",
                            categoryId: restored.categoryId ?? r.categoryId,
                            categoryName:
                              restored.categoryName ?? r.categoryName,
                            stockQuantity:
                              restored.stockQuantity ?? r.stockQuantity,
                            unit: restored.unit ?? r.unit,
                            primaryImageUrl:
                              restored.primaryImageUrl ?? r.primaryImageUrl,
                          } as ProductRow)
                        : r
                  );

                  // Eğer şu an "Silinen" filtresindeysek, geri yüklenen ürünü listeden çıkar
                  // (çünkü artık aktif)
                  // Aktif veya Tümü filtresinde isek listede kalır.
                  if (statusFilter === "SİLİNDİ") {
                    content = content.filter((r) => r.id !== row.id);
                  }

                  return { ...prev, content, numberOfElements: content.length };
                });
              } catch (e: any) {
                alert(e?.message || "Geri yükleme başarısız");
              }
            }}
          />
        ) : (
          // İlk başarılı fetch’ten sonra ve boşsa mesaj göster
          !initialLoad && (
            <div className="alert alert-primary" role="alert">
              Ürün Bulunamadı. Lütfen doğru ürünü aradığınıza emin olun.
            </div>
          )
        )}

        {/* Sayfalama */}
        {!loading && !listError && data?.totalPages > 0 && (
          <div className="row align-items-center mt-3">
            <div className="col-sm-12 col-md-12">
              <div className="dataTables_paginate paging_simple_numbers justify-content-end">
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
        )}

        {/* Düzenleme Modalı */}
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

        {/* Silme Modalı */}
        {deleting && (
          <DeleteProductModal
            target={deleting}
            onCancel={() => setDeleting(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}
