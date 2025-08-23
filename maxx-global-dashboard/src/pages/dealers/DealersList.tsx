// src/pages/dealers/DealersList.tsx
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../utils/permissions";
import type { PageResponse } from "../../types/paging";
import type { DealerRow } from "../../types/dealer";

import { listDealers } from "../../services/dealers/list";
import { deleteDealer } from "../../services/dealers/delete";
import { searchDealers } from "../../services/dealers/search";
import { listActiveDealers } from "../../services/dealers/active";
import { restoreDealer } from "../../services/dealers/restore";

import FilterPanel from "./components/FilterPanel";
import DealersTable from "./components/Table";
import DeleteDealerModal from "./components/DeleteDealerModal";
import EditDealerModal from "./components/EditDealerModal";

import type { SortDirection } from "../../types/paging";

type Page<T> = PageResponse<T>;
function toPage<T>(rows: T[], page: number, size: number): PageResponse<T> {
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
  };
}
function sortRows<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
  dir: "asc" | "desc"
) {
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    // null/undefined en sona gitsin
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    const sa = String(av);
    const sb = String(bv);
    const cmp = sa.localeCompare(sb, "tr", { sensitivity: "base" });
    return dir === "asc" ? cmp : -cmp;
  });
  return copy;
}
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

export default function DealersList() {
  const canRead = hasPermission({ anyOf: ["DEALER_READ", "DEALER_MANAGE"] });
  const canManage = hasPermission({ required: "DEALER_MANAGE" });

  if (!canManage) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok (SYSTEM_ADMIN gerekli).
      </div>
    );
  }

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sortBy, setSortBy] = useState<keyof DealerRow>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc"); // <- küçük harf

  const [data, setData] = useState<Page<DealerRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<DealerRow | null>(null);
  const [editTarget, setEditTarget] = useState<DealerRow | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // küçük yardımcılar (yalnızca bu efektte kullanılıyor)
        const dir = String(sortDir).toLowerCase() as "asc" | "desc";

        const sortRows = <T extends Record<string, any>>(
          rows: T[],
          key: keyof T,
          d: "asc" | "desc"
        ) => {
          const copy = [...rows];
          copy.sort((a, b) => {
            const av = a?.[key];
            const bv = b?.[key];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            const sa = String(av);
            const sb = String(bv);
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
          };
        };

        let pageData: PageResponse<DealerRow>;

        if (q.trim()) {
          // 1) Arama: /dealers/search  (dizi döner)
          const rows = await searchDealers(q.trim());
          const filtered = activeOnly
            ? rows.filter((r) => (r.status ?? "").toUpperCase() === "ACTIVE")
            : rows;
          const sorted = sortRows(filtered, sortBy, dir);
          pageData = toPage(sorted);
        } else if (activeOnly) {
          // 2) Sadece aktifler: /dealers/active  (dizi döner)
          const rows = await listActiveDealers();
          const sorted = sortRows(rows, sortBy, dir);
          pageData = toPage(sorted);
        } else {
          // 3) Normal sayfalı liste: /dealers  (PageResponse döner)
          pageData = await listDealers(
            {
              page,
              size,
              sortBy,
              sortDirection: dir, // "asc" | "desc"
            },
            { signal: controller.signal }
          );
        }

        setData(pageData);
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        console.error(e);
        setError("Bayiler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [q, activeOnly, page, size, sortBy, sortDir, refreshKey]);

  function toggleSort(k: keyof DealerRow) {
    if (k === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(k);
      setSortDir("asc");
    }
  }

  const sortIcon = useMemo(() => {
    return (k: keyof DealerRow) =>
      k !== sortBy ? (
        <i className="far fa-sort"></i>
      ) : sortDir === "asc" ? (
        <i className="far fa-sort-up"></i>
      ) : (
        <i className="far fa-sort-down"></i>
      );
  }, [sortBy, sortDir]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDealer(deleteTarget.id);

      // son satır silindiyse bir önceki sayfaya dön
      const isLastRowOnPage = (data?.content?.length ?? 0) === 1 && page > 0;
      if (isLastRowOnPage) setPage((p) => Math.max(0, p - 1));
      else refresh();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Bayi silinemedi.";
      alert(msg);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleRestore(row: DealerRow) {
    try {
      await restoreDealer(row.id);
      refresh();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        "Bayi geri yüklenemedi.";
      alert(msg);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Bayi Listesi</h3>
          </div>
          <div className="col-sm-12 col-md-6 d-flex justify-content-end">
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
          <div>Yükleniyor…</div>
        ) : (
          <>
            <div className="sherah-page-inner sherah-default-bg sherah-border">
              <DealersTable
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

      {/* Silme Modalı */}
      <DeleteDealerModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Düzenle Modalı */}
      {editTarget && (
        <EditDealerModal
          dealer={editTarget}
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
