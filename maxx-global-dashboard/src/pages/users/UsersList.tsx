import { useEffect, useMemo, useRef, useState } from "react";
import {
  listUsers,
  searchUsers,
  listUsersByDealer,
  listActiveUsers,
  deleteUser,
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
  const [refreshKey, setRefreshKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  }, [page, size, sortBy, sortDirection, dq, dealerId, activeOnly, refreshKey]);

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
  // UsersList component'i içinde (return'in ÜSTÜNDE)
  const isActiveStatus = (s?: string | null) => {
    if (!s) return false;
    const t = s.trim().toLocaleUpperCase("tr-TR"); // İ/ı için tr-TR önemli
    return t === "ACTIVE" || t === "AKTIF" || t === "AKTİF";
  };

  const statusClass = (s?: string | null) =>
    isActiveStatus(s)
      ? "sherah-table__status sherah-color3 sherah-color3__bg--opactity"
      : "sherah-table__status sherah-color2 sherah-color2__bg--opactity";

  // sadece USER_MANAGE olanlar silebilsin
  const canDelete = hasPermission({ required: "USER_MANAGE" });

  function askDelete(u: UserRow) {
    if (!canDelete) return;
    setDeleteTarget(u); // modal açılır
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUser(deleteTarget.id);

      // sayfayı tazele/pagination düzelt
      if (data?.content.length === 1 && page > 0) {
        setPage((p) => Math.max(0, p - 1));
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch (e) {
      console.error(e);
      alert("Kullanıcı silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null); // modal kapanır
    }
  }

  function closeDeleteModal() {
    if (deleting) return; // silme devam ederken kapatma
    setDeleteTarget(null);
  }

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
                      <th className="sherah-table__column-9 sherah-table__h9">
                        Aksiyon
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
                              <div className={statusClass(u.status)}>
                                {u.status || "-"}
                              </div>
                            </div>
                          </td>
                          {/* Aksiyon */}
                          <td className="sherah-table__column-9 sherah-table__data-9">
                            <div className="sherah-table__product-content">
                              <div className="sherah-table__status__group">
                                {/* GÜNCELLE — herkes görebilir */}
                                <a
                                  href={`/users/${u.id}/edit`}
                                  className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                                  title="Güncelle"
                                >
                                  {/* Pencil (edit) SVG — orijinalinizle aynı */}
                                  <svg
                                    className="sherah-color3__fill"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18.29"
                                    height="18.252"
                                    viewBox="0 0 18.29 18.252"
                                    aria-hidden="true"
                                  >
                                    <g transform="translate(-234.958 -37.876)">
                                      <path
                                        d="M242.545,95.779h-5.319a2.219,2.219,0,0,1-2.262-2.252c-.009-1.809,0-3.617,0-5.426q0-2.552,0-5.1a2.3,2.3,0,0,1,2.419-2.419q2.909,0,5.818,0c.531,0,.87.274.9.715a.741.741,0,0,1-.693.8c-.3.026-.594.014-.892.014q-2.534,0-5.069,0c-.7,0-.964.266-.964.976q0,5.122,0,10.245c0,.687.266.955.946.955q5.158,0,10.316,0c.665,0,.926-.265.926-.934q0-2.909,0-5.818a.765.765,0,0,1,.791-.853.744.744,0,0,1,.724.808c.007,1.023,0,2.047,0,3.07s.012,2.023-.006,3.034A2.235,2.235,0,0,1,248.5,95.73a1.83,1.83,0,0,1-.458.048Q245.293,95.782,242.545,95.779Z"
                                        transform="translate(0 -39.652)"
                                        fill="#09ad95"
                                      />
                                      <path
                                        d="M332.715,72.644l2.678,2.677c-.05.054-.119.133-.194.207q-2.814,2.815-5.634,5.625a1.113,1.113,0,0,1-.512.284c-.788.177-1.582.331-2.376.48-.5.093-.664-.092-.564-.589.157-.781.306-1.563.473-2.341a.911.911,0,0,1,.209-.437q2.918-2.938,5.853-5.86A.334.334,0,0,1,332.715,72.644Z"
                                        transform="translate(-84.622 -32.286)"
                                        fill="#09ad95"
                                      />
                                      <path
                                        d="M433.709,42.165l-2.716-2.715a15.815,15.815,0,0,1,1.356-1.248,1.886,1.886,0,0,1,2.579,2.662A17.589,17.589,0,0,1,433.709,42.165Z"
                                        transform="translate(-182.038)"
                                        fill="#09ad95"
                                      />
                                    </g>
                                  </svg>
                                </a>

                                {/* SİL — sadece USER_MANAGE görebilsin */}
                                {canDelete && (
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      askDelete(u);
                                    }}
                                    className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                                    title="Sil"
                                  >
                                    {/* Trash (delete) SVG — orijinalinizle aynı */}
                                    <svg
                                      className="sherah-color2__fill"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16.247"
                                      height="18.252"
                                      viewBox="0 0 16.247 18.252"
                                      aria-hidden="true"
                                    >
                                      <g transform="translate(-160.007 -18.718)">
                                        <path
                                          d="M185.344,88.136c0,1.393,0,2.786,0,4.179-.006,1.909-1.523,3.244-3.694,3.248q-3.623.007-7.246,0c-2.15,0-3.682-1.338-3.687-3.216q-.01-4.349,0-8.7a.828.828,0,0,1,.822-.926.871.871,0,0,1,1,.737c.016.162.006.326.006.489q0,4.161,0,8.321c0,1.061.711,1.689,1.912,1.69q3.58,0,7.161,0c1.2,0,1.906-.631,1.906-1.695q0-4.311,0-8.622a.841.841,0,0,1,.708-.907.871.871,0,0,1,1.113.844C185.349,85.1,185.343,86.618,185.344,88.136Z"
                                          transform="translate(-9.898 -58.597)"
                                        />
                                        <path d="M164.512,21.131c0-.517,0-.98,0-1.443.006-.675.327-.966,1.08-.967q2.537,0,5.074,0c.755,0,1.074.291,1.082.966.005.439.005.878.009,1.317a.615.615,0,0,0,.047.126h.428c1,0,2,0,3,0,.621,0,1.013.313,1.019.788s-.4.812-1.04.813q-7.083,0-14.165,0c-.635,0-1.046-.327-1.041-.811s.4-.786,1.018-.789C162.165,21.127,163.3,21.131,164.512,21.131Zm1.839-.021H169.9v-.764h-3.551Z" />
                                        <path
                                          d="M225.582,107.622c0,.9,0,1.806,0,2.709a.806.806,0,0,1-.787.908.818.818,0,0,1-.814-.924q0-2.69,0-5.38a.82.82,0,0,1,.81-.927.805.805,0,0,1,.79.9C225.585,105.816,225.582,106.719,225.582,107.622Z"
                                          transform="translate(-58.483 -78.508)"
                                        />
                                        <path
                                          d="M266.724,107.63c0-.9,0-1.806,0-2.709a.806.806,0,0,1,.782-.912.818.818,0,0,1,.818.919q0,2.69,0,5.38a.822.822,0,0,1-.806.931c-.488,0-.792-.356-.794-.938C266.721,109.411,266.724,108.521,266.724,107.63Z"
                                          transform="translate(-97.561 -78.509)"
                                        />
                                      </g>
                                    </svg>
                                  </a>
                                )}
                              </div>
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

      {deleteTarget && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteModalLabel"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeDeleteModal();
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="deleteModalLabel">
                    Kullanıcıyı Sil
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Kapat"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  />
                </div>

                <div className="modal-body">
                  <p className="mb-0">
                    <strong>
                      {deleteTarget.firstName} {deleteTarget.lastName}
                    </strong>{" "}
                    kullanıcısını silmek istiyor musunuz?
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Siliniyor…
                      </>
                    ) : (
                      "Evet, Sil"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
