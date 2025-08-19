import { useEffect, useMemo, useState } from "react";
import {
  listUsers,
  type PageResponse,
  type UserRow,
  type SortDirection,
} from "../../services/userService";
import { hasPermission } from "../../utils/permissions";
import { useSearchParams } from "react-router-dom";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const DEFAULT_SORT_BY = "firstName";
const DEFAULT_SORT_DIR: SortDirection = "asc";

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
    setSearchParams(params, { replace: true });
  }, [page, size, sortBy, sortDirection, setSearchParams]);

  // Veri çek
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listUsers({ page, size, sortBy, sortDirection });
        setData(res);
      } catch (e: any) {
        console.error(e);
        setError("Kullanıcılar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size, sortBy, sortDirection]);

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

  return (
    <div className="sherah-card">
      <div className="sherah-card__header">
        <h3 className="sherah-card__title py-3">Kullanıcı Listesi</h3>
        <div className="sherah-card__actions">
          {/* <select
            className="sherah-wc__form-input"
            value={size}
            onChange={onChangeSize}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select> */}
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
