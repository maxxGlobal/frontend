// src/pages/catalog/ProductList.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
type ViewMode = "detail" | "compact";

function isAbortError(err: any) {
  return (
    err?.name === "AbortError" ||
    err?.code === "ERR_CANCELED" ||
    String(err?.message || "").toLowerCase().includes("abort") ||
    String(err?.message || "").toLowerCase().includes("canceled")
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den başlangıç değerleri
  const urlPage = Math.max(1, Number(searchParams.get("page") || "1"));
  const urlQ = searchParams.get("q") || "";
  const urlCat = searchParams.get("cat");
  const urlView = (searchParams.get("view") as ViewMode) || "detail";

  const initialCat = urlCat ? Number(urlCat) : null;

  const [cats, setCats] = useState<CatNode[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(initialCat);

  const [q, setQ] = useState(urlQ);
  const [sort] = useState<"top" | "popular" | "newest">("top");
  const [statusFilter] = useState<StatusFilter>("ALL");
  const [debouncedQ, setDebouncedQ] = useState(urlQ);
const ACTIVE_STATUS = "AKTİF" as ProductRow["status"];

  const [page, setPage] = useState(Math.max(0, urlPage - 1)); // 0-based

  // Görünüm modu (URL ile senkron)
  const [viewMode, setViewMode] = useState<ViewMode>(urlView);

  // Mod'a göre sayfa boyutu: detail:12, compact:30
  const defaultSizeForMode = useMemo(
    () => (viewMode === "compact" ? 28 : 12),
    [viewMode]
  );

  const [size, setSize] = useState<number>(defaultSizeForMode);

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

  function flattenTreeToOptions(
    nodes: CatNode[],
    depth = 0
  ): { id: number; label: string; name?: string }[] {
    const out: { id: number; label: string; name?: string }[] = [];

    nodes.forEach((n) => {
      const indent = "\u00A0\u00A0".repeat(depth);

      let emoji = "";
      if (depth === 0) emoji = "🗂️";
      else if (depth === 1) emoji = "📁";
      else if (depth >= 2) emoji = "📂";

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

  // Kategorileri tek sefer yükle
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        const tree = buildCategoryTree(flat);
        setCats(tree);
        const leveled = flattenTreeToOptions(tree);
        setCategories(leveled);
      } catch (err) {
        if (isAbortError(err)) return;
        console.error("Kategori yükleme hatası:", err);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  // Görünüm modu değişince sayfa boyutunu ayarla
  useEffect(() => {
    setSize(defaultSizeForMode);
  }, [defaultSizeForMode]);

  // Ürünleri yükle
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
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

        if (debouncedQ && debouncedQ.trim() !== "") {
          res = await listProductsBySearch(debouncedQ.trim(), baseReq, {
            signal: controller.signal,
          });
        } else if (selectedCat) {
          res = await listProductsByCategory(selectedCat, {
            signal: controller.signal,
          } as any);
        } else {
          res = await listProducts(baseReq, { signal: controller.signal });
        }

        setData(res);
        setInitialLoad(false);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error("Ürün yükleme hatası:", e);
        setListError("Ürünler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [debouncedQ, page, size, sort, selectedCat]);

  // URL ile state'i senkronize et
  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", String(page + 1));

    if (debouncedQ && debouncedQ.trim() !== "") {
      params.set("q", debouncedQ.trim());
    }

    if (selectedCat) {
      params.set("cat", String(selectedCat));
    }

    params.set("view", viewMode);

    setSearchParams(params, { replace: true });
  }, [page, debouncedQ, selectedCat, viewMode, setSearchParams]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q === debouncedQ) return;
      if (q.length >= 3 || q.length === 0) {
        setDebouncedQ(q);
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [q, debouncedQ]);

  // Compact List Component
  function CompactList({
    data,
    canManage,
    onView,
    onEdit,
    onAskDelete,
  }: {
    data: PageResponse<ProductRow>;
    canManage?: boolean;
    onView: (p: ProductRow) => void;
    onEdit?: (p: ProductRow) => void;
    onAskDelete?: (p: ProductRow) => void;
  }) {
    const FALLBACK = "/assets/img/resim-yok.jpg";

    return (
      <div className="container-fluid px-0">
        <div className="row g-3">
          {data.content.map((p) => (
            <div key={p.id} className="col-12 col-md-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onView(p)}
                onKeyDown={(e) => (e.key === "Enter" ? onView(p) : null)}
                className="d-flex align-items-center justify-content-between p-2 rounded border shadow-sm bg-white"
                style={{
                  minHeight: 70,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color .15s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "white")
                }
              >
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <img
                    src={p.primaryImageUrl || FALLBACK}
                    alt={p.name}
                    width={55}
                    height={55}
                    className="rounded border"
                    style={{ objectFit: "cover" }}
                  />
                  <span
                    className="text-truncate"
                    style={{ maxWidth: "180px" }}
                    title={p.name}
                  >
                    {p.name}
                  </span>
                </div>

                <div className="d-flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(p);
                    }}
                    title="Görüntüle"
                  >
                    <i className="fa-regular fa-eye" />
                  </button>

                  {canManage && onEdit && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(p);
                      }}
                      title="Düzenle"
                    >
                      <i className="fa-regular fa-pen-to-square" />
                    </button>
                  )}

                  {canManage && onAskDelete && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskDelete(p);
                      }}
                      title="Sil"
                    >
                      <i className="fa-regular fa-trash-can" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

  const handleSearchChange = (value: string) => setQ(value);

  const clearSearch = () => {
    setQ("");
    setDebouncedQ("");
    setPage(0);
  };

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

  // View mode değiştir handler
  const handleViewModeChange = (newMode: ViewMode) => {
    // Hemen loading başlat
     setLoading(true);
     setPage(0);
   
      setData(prev => ({ ...prev, content: [], numberOfElements: 0 }));

    // State'leri güncelle
    setViewMode(newMode);
   
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="sherah-breadcrumb__right mg-top-30 d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="sherah-breadcrumb__right--first d-flex align-items-center gap-2">
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
                placeholder="Ürün adı / kodu ara… (min 3 karakter)"
                value={q}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {q && (
                <button
                  className="btn btn-clear"
                  onClick={clearSearch}
                  title="Aramayı temizle"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {q.length > 0 && q.length < 3 && (
              <small className="text-muted">En az 3 karakter girin</small>
            )}

            {debouncedQ && debouncedQ !== q && (
              <small className="text-info">
                <i className="fa-solid fa-spinner fa-spin me-1"></i>
                Aranıyor...
              </small>
            )}
          </div>

          <div className="sherah-breadcrumb__right--second d-flex align-items-center gap-2">
            {/* Görünüm seçici */}
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Görünüm"
                disabled={loading}
              >
                <i className="fa-solid fa-table-cells-large me-2" />
                {viewMode === "detail" ? "Detaylı Listeleme" : "Küçük simgeler"}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className={`dropdown-item ${
                      viewMode === "detail" ? "active" : ""
                    }`}
                    onClick={() => handleViewModeChange("detail")}
                    disabled={loading}
                  >
                    Detaylı Listeleme
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      viewMode === "compact" ? "active" : ""
                    }`}
                    onClick={() => handleViewModeChange("compact")}
                    disabled={loading}
                  >
                    Küçük simgelerle listeleme
                  </button>
                </li>
              </ul>
            </div>

            <a href="/product-add" className="sherah-btn sherah-gbcolor">
              Ürün Ekle
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3 text-muted">Ürünler yükleniyor...</p>
          </div>
        ) : listError ? (
          <div className="alert alert-danger mt-4" role="alert">
            {listError}
          </div>
        ) : data && data.content.length > 0 ? (
          viewMode === "detail" ? (
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

    setData((prev): PageResponse<ProductRow> => {
      const content: ProductRow[] = prev.content.map((r) => {
        if (r.id !== row.id) return r;

        // ProductRow tipine uygun PATCH
        const patched: ProductRow = {
          ...r,
          // restored'dan gelenler varsa al, yoksa eskisi kalsın:
          id: restored.id ?? r.id,
          name: restored.name ?? r.name,
          code: restored.code ?? r.code,
          description: (restored as any).description ?? r.description,
          categoryId: restored.categoryId ?? r.categoryId,
          categoryName: (restored as any).categoryName ?? r.categoryName,
          stockQuantity: (restored as any).stockQuantity ?? r.stockQuantity,
          unit: (restored as any).unit ?? r.unit,
          isInStock: (restored as any).isInStock ?? r.isInStock,
          primaryImageUrl:
            (restored as any).primaryImageUrl ?? r.primaryImageUrl,

          // status alanını ProductRow["status"] olarak ver
          status: ACTIVE_STATUS,
          isActive: true,
        };

        return patched;
      });

      return {
        ...prev,
        content,
        numberOfElements: content.length,
      } as PageResponse<ProductRow>;
    });
  } catch (e: any) {
    alert(e?.message || "Geri yükleme başarısız");
  }
}}

            />
          ) : (
            <CompactList
              data={data}
              canManage={true}
              onView={(product) => navigate(`/products/${product.id}`)}
              onEdit={(product) => setEditing(product)}
              onAskDelete={(product) => setDeleting(product)}
            />
          )
        ) : (
          !initialLoad && (
            <div className="alert alert-primary mt-4" role="alert">
              Ürün Bulunamadı. Lütfen doğru ürünü aradığınıza emin olun.
            </div>
          )
        )}

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
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}