import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategorySidebar from "../products/components/CategorySidebar";
import ProductsGrid from "../products/components/Grid";

import type { PageResponse } from "../../types/paging";
import type { ProductRow } from "../../types/product";

import { listProducts } from "../../services/products/list";
import { listProductsByCategory } from "../../services/products/listByCategory";
import { listProductsBySearch } from "../../services/products/search";
import { listAllCategories } from "../../services/categories/listAll";

import {
  buildCategoryTree,
  type CatNode,
} from "../../services/categories/buildTree";

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
  const navigate = useNavigate();

  // Kategorileri yükle
  async function loadCategories(signal?: AbortSignal) {
    try {
      setLoading(true);
      setError(null);

      const flat = await listAllCategories({ signal });
      const tree = buildCategoryTree(flat);

      setCats(tree);
    } catch (err) {
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
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let res;

        // Eğer arama sorgusu varsa, aramaya öncelik ver
        if (q && q.trim() !== "") {
          res = await listProductsBySearch(
            q.trim(),
            {
              page,
              size,
              sortBy: sort === "newest" ? "createdAt" : "name",
              sortDirection: sort === "newest" ? "desc" : "asc",
            },
            { signal: controller.signal }
          );
        }
        // Eğer kategori seçiliyse kategoriye göre getir
        else if (selectedCat) {
          res = await listProductsByCategory(selectedCat, {
            signal: controller.signal,
          });
        }
        // Aksi halde tüm ürünleri getir
        else {
          res = await listProducts(
            {
              page,
              size,
              sortBy: sort === "newest" ? "createdAt" : "name",
              sortDirection: sort === "newest" ? "desc" : "asc",
            },
            { signal: controller.signal }
          );
        }

        if (mounted) setData(res);
      } catch (e) {
        console.error("Ürünler yüklenemedi:", e);
        if (mounted) setData(makeDefaultPage<ProductRow>(size));
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [page, size, sort, selectedCat, q]);

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

          {/* Ürün Ekle Butonu */}
          <div className="sherah-breadcrumb__right--second">
            <a href="/product-add" className="sherah-btn sherah-gbcolor">
              Ürün Ekle
            </a>
          </div>
        </div>

        {/* Ürünler Grid */}
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
            onEdit={(product) => navigate(`/products/${product.id}/edit`)}
            onAskDelete={(product) => {
              if (
                window.confirm(
                  `${product.name} adlı ürünü silmek istiyor musun?`
                )
              ) {
                fetch(`http://localhost:8080/api/products/${product.id}`, {
                  method: "DELETE",
                }).then(() => {
                  alert("Ürün başarıyla silindi!");
                  setData((prev) => ({
                    ...prev,
                    content: prev.content.filter((p) => p.id !== product.id),
                  }));
                });
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

        {/* Sayfalama */}
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
      </div>
    </div>
  );
}
