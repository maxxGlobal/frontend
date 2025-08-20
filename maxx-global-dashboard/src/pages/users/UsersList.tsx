import { useEffect, useMemo, useRef, useState } from "react";
import {
  listUsers,
  searchUsers,
  listUsersByDealer,
  listActiveUsers,
  type PageResponse,
  type UserRow,
  type SortDirection,
} from "../../services/userService";
import {
  getDealerSummaries,
  type DealerSummary,
} from "../../services/dealerService";
import { hasPermission } from "../../utils/permissions";
import { useSearchParams } from "react-router-dom";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const DEFAULT_SORT_BY = "firstName";
const DEFAULT_SORT_DIR: SortDirection = "asc";

function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// sayfalı olmayan aktif endpointi için küçük yardımcı
function toPage<T>(rows: T[], page: number, size: number): PageResponse<T> {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const from = page * size;
  const content = rows.slice(from, from + size);
  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

export default function UsersList() {
  if (!hasPermission({ required: "USER_MANAGE" })) {
    return (
      <div className="alert alert-danger m-3">
        Bu sayfaya erişim yetkiniz yok.
      </div>
    );
  }

  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || DEFAULT_PAGE
  );
  const [size, setSize] = useState<number>(
    Number(searchParams.get("size")) || DEFAULT_SIZE
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || DEFAULT_SORT_BY
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get("sortDirection") as SortDirection) || DEFAULT_SORT_DIR
  );
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const dq = useDebounced(q, 350); // debounce'lu değer
  // 🔽 YENİ FİLTRE DURUMLARI
  const [dealers, setDealers] = useState<DealerSummary[]>([]);
  const [dealerId, setDealerId] = useState<number | "">(
    Number(searchParams.get("dealerId")) || ""
  );
  const [activeOnly, setActiveOnly] = useState<boolean>(
    searchParams.get("active") === "1"
  );

  const [data, setData] = useState<PageResponse<UserRow> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL senkronu
  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      sortBy,
      sortDirection,
    };
    if (dq.trim()) params.q = dq.trim();
    if (dealerId) params.dealerId = String(dealerId);
    if (activeOnly) params.active = "1";
    setSearchParams(params, { replace: true });
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    dq,
    dealerId,
    activeOnly,
    setSearchParams,
  ]);

  // Bayileri çek (mevcut getDealerSummaries kullanılacak)
  useEffect(() => {
    (async () => {
      try {
        const list = await getDealerSummaries();
        setDealers(list);
      } catch (e) {
        console.warn("Bayiler alınamadı", e);
      }
    })();
  }, []);

  // Veri çek
  useEffect(() => {
    const controller = new AbortController(); // <— iptal için
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeOnly) {
          const raw = await listActiveUsers(
            { page: 0, size: 10000, sortBy, sortDirection },
            { signal: controller.signal }
          );
          const rows: UserRow[] = Array.isArray(raw)
            ? raw
            : (raw as PageResponse<UserRow>).content;
          const filtered = dealerId
            ? rows.filter((u) => u.dealer?.id === Number(dealerId))
            : rows;
          const paged = toPage(filtered, page, size);
          if (!cancelled) setData(paged);
          return;
        }

        if (dealerId) {
          const res = await listUsersByDealer(
            { dealerId: Number(dealerId), page, size, sortBy, sortDirection },
            { signal: controller.signal }
          );
          if (!cancelled) setData(res);
          return;
        }

        const t = dq.trim();
        const useSearch = t.length >= 3;
        const res = useSearch
          ? await searchUsers(
              { q: t, page, size, sortBy, sortDirection },
              { signal: controller.signal }
            )
          : await listUsers(
              { page, size, sortBy, sortDirection },
              { signal: controller.signal }
            );

        if (!cancelled) setData(res);
      } catch (e: any) {
        if (e.name === "CanceledError" || e.name === "AbortError") return;
        console.error(e);
        if (!cancelled) setError("Kullanıcılar yüklenirken bir hata oluştu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, size, sortBy, sortDirection, dq, dealerId, activeOnly]);

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const sortIcon = useMemo(() => {
    return (col: string) =>
      sortBy === col ? (sortDirection === "asc" ? "▲" : "▼") : "⇅";
  }, [sortBy, sortDirection]);

  const onChangeSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  const fmtDate = (iso: string | number | Date) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };
  const selectedDealerName =
    dealerId === ""
      ? "Tümü"
      : dealers.find((d) => d.id === dealerId)?.name ?? "Tümü";

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Kullanıcı Listesi</h3>
          </div>
          <div className="col-sm-12 col-md-6">
            <div id="sherah-table__vendor_filter" className="filter-panel">
              {/* ÜST SATIR: Bayi + Aktif switch */}
              <div className="filter-top">
                {/* Bayi seçimi */}
                <div className="input-group input-group-sm filter-select has-caret">
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-light d-flex align-items-center gap-2 dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fa-solid fa-store text-muted" />
                      <span>{selectedDealerName}</span>
                    </button>

                    <ul className="dropdown-menu shadow-sm">
                      <li>
                        <button
                          className={`dropdown-item ${
                            dealerId === "" ? "active" : ""
                          }`}
                          onClick={() => {
                            setDealerId("");
                            setPage(0);
                          }}
                        >
                          Tümü
                        </button>
                      </li>

                      {dealers.map((d) => (
                        <li key={d.id}>
                          <button
                            className={`dropdown-item ${
                              dealerId === d.id ? "active" : ""
                            }`}
                            onClick={() => {
                              setDealerId(d.id);
                              setPage(0);
                            }}
                          >
                            {d.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Aktif kullanıcılar */}
                <div className="filter-switch">
                  <span className="label">Aktif Kullanıcılar</span>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="onlyActive"
                      checked={activeOnly}
                      onChange={() => {
                        setActiveOnly((s) => !s);
                        setPage(0);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ALT SATIR: Arama */}
              <div className="input-group input-group-sm filter-search flex-nowrap">
                <span className="input-group-text">
                  <i className="fa-solid fa-magnifying-glass" />
                </span>

                <input
                  type="search"
                  className="form-control sherah-wc__form-input"
                  placeholder="Ad, soyad, e-posta, telefon, adres…"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(0);
                  }}
                  aria-controls="sherah-table__vendor"
                />

                {q && (
                  <button
                    type="button"
                    className="btn btn-clear"
                    onClick={() => {
                      setQ("");
                      setPage(0);
                    }}
                    title="Temizle"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="sherah-card__body">
        {loading ? (
          <div>Yükleniyor…</div>
        ) : (
          <>
            <div className="sherah-page-inner sherah-default-bg sherah-border">
              <div className="sherah-table p-0">
                <table
                  id="sherah-table__vendor"
                  className="sherah-table__main sherah-table__main-v3"
                >
                  {/* HEAD */}
                  <thead className="sherah-table__head">
                    <tr>
                      <th
                        className="sherah-table__column-1 sherah-table__h1"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("firstName")}
                      >
                        Ad {sortIcon("firstName")}
                      </th>
                      <th
                        className="sherah-table__column-2 sherah-table__h2"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("lastName")}
                      >
                        Soyad {sortIcon("lastName")}
                      </th>
                      <th
                        className="sherah-table__column-3 sherah-table__h3"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("email")}
                      >
                        E-posta {sortIcon("email")}
                      </th>
                      <th className="sherah-table__column-4 sherah-table__h4">
                        Telefon
                      </th>
                      <th className="sherah-table__column-5 sherah-table__h5">
                        Bayi
                      </th>
                      <th className="sherah-table__column-6 sherah-table__h6">
                        Roller
                      </th>
                      <th
                        className="sherah-table__column-7 sherah-table__h7"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("createdAt")}
                      >
                        Oluşturma {sortIcon("createdAt")}
                      </th>
                      <th
                        className="sherah-table__column-8 sherah-table__h8"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("status")}
                      >
                        Durum {sortIcon("status")}
                      </th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="sherah-table__body">
                    {data && data.content.length > 0 ? (
                      data.content.map((u) => (
                        <tr key={u.id}>
                          {/* Ad */}
                          <td className="sherah-table__column-1 sherah-table__data-1">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.firstName}
                              </p>
                            </div>
                          </td>

                          {/* Soyad */}
                          <td className="sherah-table__column-2 sherah-table__data-2">
                            <div className="sherah-table__vendor">
                              <h4 className="sherah-table__vendor--title">
                                {/* İstersen kullanıcı profiline götürecek link: */}
                                <a href={`/users/${u.id}`}>{u.lastName}</a>
                              </h4>
                            </div>
                          </td>

                          {/* E-posta */}
                          <td className="sherah-table__column-3 sherah-table__data-3">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.email}
                              </p>
                            </div>
                          </td>

                          {/* Telefon */}
                          <td className="sherah-table__column-4 sherah-table__data-4">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.phoneNumber || "-"}
                              </p>
                            </div>
                          </td>

                          {/* Bayi */}
                          <td className="sherah-table__column-5 sherah-table__data-5">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.dealer?.name || "-"}
                              </p>
                            </div>
                          </td>

                          {/* Roller */}
                          <td className="sherah-table__column-6 sherah-table__data-6">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.roles?.map((r) => r.name).join(", ") || "-"}
                              </p>
                            </div>
                          </td>

                          {/* Oluşturma */}
                          <td className="sherah-table__column-7 sherah-table__data-7">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {fmtDate(u.createdAt)}
                              </p>
                            </div>
                          </td>

                          {/* Durum */}
                          <td className="sherah-table__column-8 sherah-table__data-8">
                            <div className="sherah-table__product-content">
                              <p className="sherah-table__product-desc">
                                {u.status}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          Kayıt bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data && (
              <div className="row align-items-center mt-3">
                {/* Sol taraf: bilgi metni */}
                <div className="col-sm-12 col-md-5">
                  Toplam <strong>{data.totalElements}</strong> kayıt • Sayfa{" "}
                  {data.number + 1} / {data.totalPages}
                </div>

                {/* Sağ taraf: DataTables tarzı pager */}
                <div className="col-sm-12 col-md-7">
                  <div
                    className="dataTables_paginate paging_simple_numbers"
                    id="sherah-table__vendor_paginate"
                  >
                    <ul className="pagination">
                      {/* Previous */}
                      <li
                        className={`paginate_button page-item previous ${
                          data.first ? "disabled" : ""
                        }`}
                        id="sherah-table__vendor_previous"
                      >
                        <a
                          href="#"
                          aria-controls="sherah-table__vendor"
                          data-dt-idx="previous"
                          tabIndex={0}
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!data.first) setPage((p) => Math.max(0, p - 1));
                          }}
                        >
                          <i className="fas fa-angle-left" />
                        </a>
                      </li>

                      {/* Sayfa numaraları */}
                      {Array.from({ length: data.totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`paginate_button page-item ${
                            i === data.number ? "active" : ""
                          }`}
                        >
                          <a
                            href="#"
                            aria-controls="sherah-table__vendor"
                            data-dt-idx={i}
                            tabIndex={0}
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

                      {/* Next */}
                      <li
                        className={`paginate_button page-item next ${
                          data.last ? "disabled" : ""
                        }`}
                        id="sherah-table__vendor_next"
                      >
                        <a
                          href="#"
                          aria-controls="sherah-table__vendor"
                          data-dt-idx="next"
                          tabIndex={0}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
