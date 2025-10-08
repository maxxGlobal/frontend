// src/pages/catalog/ProductList.tsx
import { useEffect, useState } from "react";
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
  const [sort] = useState<"top" | "popular" | "newest">("top");
  const [statusFilter] = useState<StatusFilter>("ALL");
  const [debouncedQ, setDebouncedQ] = useState("");

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
      const indent = "\u00A0\u00A0".repeat(depth);

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

  // ✅ Kategorileri sadece bir kez yükle
  useEffect(() => {
    console.log("🔵 KATEGORI EFFECT ÇALIŞTI");
    const controller = new AbortController();
    
    async function loadCategories() {
      try {
        console.log("📂 Kategoriler yükleniyor...");
        const flat = await listAllCategories({ signal: controller.signal });
        const tree = buildCategoryTree(flat);
        setCats(tree);

        const leveled = flattenTreeToOptions(tree);
        setCategories(leveled);
        console.log("✅ Kategoriler yüklendi");
      } catch (err) {
        if (isAbortError(err)) return;
        console.error("❌ Kategori yükleme hatası:", err);
      }
    }

    loadCategories();
    return () => {
      console.log("🔴 KATEGORI EFFECT CLEANUP");
      controller.abort();
    };
  }, []); // Sadece ilk mount'ta çalışır

  // ✅ Ürünleri yükle
  useEffect(() => {
    console.log("🟢 ÜRÜN EFFECT ÇALIŞTI", { debouncedQ, page, selectedCat });
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
          console.log("🔍 ARAMA isteği gönderiliyor:", debouncedQ);
          res = await listProductsBySearch(debouncedQ.trim(), baseReq, {
            signal: controller.signal,
          });
        } else if (selectedCat) {
          console.log("📁 KATEGORİ isteği gönderiliyor:", selectedCat);
          res = await listProductsByCategory(selectedCat, { 
            signal: controller.signal 
          });
        } else {
          console.log("📋 TÜM ÜRÜNLER isteği gönderiliyor");
          res = await listProducts(baseReq, { 
            signal: controller.signal 
          });
        }

        console.log("✅ Ürünler alındı:", res.content.length);
        setData(res);
        setInitialLoad(false);
      } catch (e: any) {
        if (isAbortError(e)) {
          console.log("⚠️ İstek iptal edildi");
          return;
        }
        console.error("❌ Ürün yükleme hatası:", e);
        setListError("Ürünler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      console.log("🔴 ÜRÜN EFFECT CLEANUP");
      controller.abort();
    };
  }, [debouncedQ, page, size, sort, selectedCat]); // Sadece bu değerler değiştiğinde çalışır

  // ✅ Debounce için
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.length >= 3 || q.length === 0) {
        setDebouncedQ(q);
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [q]);

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

  const handleSearchChange = (value: string) => {
    setQ(value);
  };

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
          !initialLoad && (
            <div className="alert alert-primary" role="alert">
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