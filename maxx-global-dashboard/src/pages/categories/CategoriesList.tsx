// src/pages/categories/CategoriesList.tsx
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import type { PageResponse } from "../../types/paging";
import type { CategoryRow } from "../../types/category";

import { listCategories } from "../../services/categories/list";
import { searchCategories } from "../../services/categories/search";
import { listActiveCategories } from "../../services/categories/active";
import { deleteCategory } from "../../services/categories/delete";
import { restoreCategory } from "../../services/categories/restore";

import FilterPanel from "./components/FilterPanel";
import CategoriesTable from "./components/Table";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import LoaderStyleOne from "../homepage/Helpers/Loaders/LoaderStyleOne";

type Page<T> = PageResponse<T>;
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

export default function CategoriesList() {
  const canRead = hasPermission({
    anyOf: ["CATEGORY_READ", "CATEGORY_MANAGE"],
  });
  const canManage = hasPermission({ required: "CATEGORY_MANAGE" });

  if (!canRead) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (CATEGORY_READ veya CATEGORY_MANAGE
        gerekli).
      </div>
    );
  }

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sortBy, setSortBy] = useState<keyof CategoryRow>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [data, setData] = useState<Page<CategoryRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [editTarget, setEditTarget] = useState<CategoryRow | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const dir = sortDir;

        const sortRows = <T extends Record<string, any>>(
          rows: T[],
          key: keyof T,
          d: "asc" | "desc"
        ) => {
          const copy = [...rows];
          copy.sort((a, b) => {
            const sa = String(a?.[key] ?? "");
            const sb = String(b?.[key] ?? "");
            const cmp = sa.localeCompare(sb, "tr", { sensitivity: "base" });
            return d === "asc" ? cmp : -cmp;
          });
          return copy;
        };

        const toPage = <T,>(rows: T[]) => {
          const totalElements = rows.length;
          const totalPages = Math.max(1, Math.ceil(totalElements / size));
          const from = page * size;
          return {
            content: rows.slice(from, from + size),
            totalElements,
            totalPages,
            number: page,
            size,
            first: page === 0,
            last: page >= totalPages - 1,
          } as PageResponse<T>;
        };

        let pageData: PageResponse<CategoryRow>;

        if (q.trim()) {
          const rows = await searchCategories(q.trim());
          const filtered = activeOnly
            ? rows.filter((r) => (r.status ?? "").toUpperCase() === "ACTIVE")
            : rows;
          const sorted = sortRows(filtered, sortBy, dir);
          pageData = toPage(sorted);
        } else if (activeOnly) {
          const rows = await listActiveCategories();
          const sorted = sortRows(rows, sortBy, dir);
          pageData = toPage(sorted);
        } else {
          pageData = await listCategories(
            {
              page,
              size,
              sortBy,
              sortDirection: dir,
            },
            { signal: abort.signal }
          );
        }

        setData(pageData);
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        console.error(e);
        setError("Kategoriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [q, activeOnly, page, size, sortBy, sortDir, refreshKey]);

  function toggleSort(k: keyof CategoryRow) {
    if (k === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(k);
      setSortDir("asc");
    }
  }

  const sortIcon = useMemo(
    () => (k: keyof CategoryRow) =>
      k !== sortBy ? (
        <i className="far fa-sort" />
      ) : sortDir === "asc" ? (
        <i className="far fa-sort-up" />
      ) : (
        <i className="far fa-sort-down" />
      ),
    [sortBy, sortDir]
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      const isLastRowOnPage = (data?.content?.length ?? 0) === 1 && page > 0;
      if (isLastRowOnPage) setPage((p) => Math.max(0, p - 1));
      else refresh();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Kategori silinemedi.";
      alert(msg);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleRestore(row: CategoryRow) {
    try {
      await restoreCategory(row.id);
      refresh();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Kategori geri yüklenemedi.";
      alert(msg);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Kategori Listesi</h3>
          </div>
          <div className="col-sm-12 col-md-6 d-flex justify-content-end categories-list">
            <FilterPanel
              q={q}
              setQ={(v) => {
                setQ(v);
                setPage(0);
              }}
              activeOnly={activeOnly}
              setActiveOnly={(v) => {
                setActiveOnly(v);
                setPage(0);
              }}
              size={size}
              onChangeSize={(v) => {
                setSize(v);
                setPage(0);
              }}
              onRefresh={refresh}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="sherah-card__body">
        {loading || !data ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">
                <LoaderStyleOne />
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="sherah-page-inner sherah-default-bg sherah-border">
              <CategoriesTable
                data={data}
                canManage={canManage}
                toggleSort={toggleSort}
                sortIcon={sortIcon}
                onEdit={(r) => canManage && setEditTarget(r)}
                onAskDelete={(r) => canManage && setDeleteTarget(r)}
                onRestore={(r) => canManage && handleRestore(r)}
              />
            </div>

            {/* Pagination */}
            <div className="row align-items-center mt-3 justify-content-end">
              <div className="col-sm-12 col-md-13">
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
                            setPage((p) =>
                              Math.min(data.totalPages - 1, p + 1)
                            );
                        }}
                      >
                        <i className="fas fa-angle-right" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteCategoryModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {editTarget && (
        <EditCategoryModal
          category={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);

            refresh();
          }}
        />
      )}
    </div>
  );
}
