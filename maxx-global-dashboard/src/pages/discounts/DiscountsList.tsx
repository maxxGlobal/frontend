// src/pages/discounts/DiscountsList.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscounts } from "../../services/discounts/list";
import { restoreDiscount } from "../../services/discounts/restore";
import { searchDiscounts } from "../../services/discounts/search";
import type { Discount, PageResponse } from "../../types/discount";
import EditDiscountModal from "./components/EditDiscountModal";
import DeleteDiscountModal from "./components/DeleteDiscountModal";
import PopoverBadgeProduct from "../../components/popover/PopoverBadgeProduct";
import PopoverBadgeDealer from "../../components/popover/PopoverBadgeDealer";

export default function DiscountsList() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Discount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const size = 30;
  // Search & sort state
  const [q, setQ] = useState("");

  // Modal state
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);

  async function loadData(p = 0) {
    try {
      setLoading(true);
      const query = q.trim();
      const res =
        query.length >= 2
          ? await searchDiscounts(query, p, size)
          : await listDiscounts(p, size);
      setPageData(res);
      setPage(res.number ?? p);
    } catch {
      Swal.fire("Hata", "İndirimler yüklenemedi", "error");
      setPageData({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: 0,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true,
      });
      setPage(0);
    } finally {
      setLoading(false);
    }
  }

  const didInitialFetch = useRef(false);

  useEffect(() => {
    const query = q.trim();

    // İlk yükleme kontrolü
    if (query.length === 0 && !didInitialFetch.current) {
      didInitialFetch.current = true;
      loadData(0);
      return; // erken çık, aşağıya düşmesin
    }

    // Normal akış
    if (query.length === 0) {
      const t = setTimeout(() => loadData(0), 0);
      return () => clearTimeout(t);
    }

    if (query.length < 2) return;

    const t = setTimeout(() => loadData(0), 300);
    return () => clearTimeout(t);
  }, [q]);

  async function handleRestore(id: number) {
    const result = await Swal.fire({
      title: "Geri Yükle",
      text: "Bu indirim geri yüklenecek. Onaylıyor musunuz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, geri yükle",
      cancelButtonText: "Vazgeç",
    });
    if (!result.isConfirmed) return;

    try {
      await restoreDiscount(id);
      await Swal.fire("Başarılı", "İndirim geri yüklendi", "success");
      loadData(page);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Geri yükleme yapılamadı";
      Swal.fire("Hata", msg, "error");
    }
  }

  const hasRows =
    !!pageData &&
    Array.isArray(pageData.content) &&
    pageData.content.length > 0;

  function nextPage() {
    if (pageData?.last) return;
    loadData(page + 1);
  }

  function prevPage() {
    if (page <= 0 || pageData?.first) return;
    loadData(page - 1);
  }

  const isPassive = (d: Discount) => {
    const st = (d.status ?? "").toString().toUpperCase();
    return (
      st === "PASSIVE" ||
      st === "PASİF" ||
      st === "PASIF" ||
      d.isActive === false
    );
  };

  // ---- helpers: rozetler ----
  function namesFrom<T extends { id: number; name?: string }>(arr?: T[]) {
    const list = Array.isArray(arr) ? arr : [];
    return list.map((x) => (x.name?.trim() ? x.name : `#${x.id}`));
  }
  function renderBadges<T extends { id: number; name?: string }>(
    arr?: T[],
    max = 3
  ) {
    const all = namesFrom(arr);
    const shown = all.slice(0, max);
    const rest = all.slice(max);
    const restTitle = rest.join(", ");

    return (
      <div className="d-flex flex-wrap gap-1" title={all.join(", ")}>
        {shown.map((n, i) => (
          <span key={i} className="bg-success border-0">
            {n}
          </span>
        ))}
        {rest.length > 0 && (
          <span className="bg-success border-0" title={restTitle}>
            +{rest.length}
          </span>
        )}
      </div>
    );
  }
  const statusBadge = (s?: string | null) =>
    s === "AKTİF" ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    );
  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer mb-4">
        <div className="row align-items-center justify-content-between border-bottom pb-3 mb-3">
          {/* Başlık */}
          <div className="col-md-8 mb-2 mb-md-0">
            <h2 className="sherah-card__title m-0 fw-bold">İndirim Listesi</h2>
          </div>

          {/* Butonlar */}
          <div className="col-md-4 d-flex flex-wrap justify-content-md-end gap-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/discounts-create")}
            >
              <i className="fa fa-plus me-1"></i> Yeni İndirim
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/discounts/calculate")}
            >
              <i className="fa fa-calculator me-1"></i> Hesapla
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/discounts/upcoming")}
            >
              <i className="fa fa-clock me-1"></i> Yaklaşan
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/discounts/by-product")}
            >
              <i className="fa fa-box me-1"></i> Ürünlere Göre
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/discounts/expired")}
            >
              <i className="fa fa-hourglass-end me-1"></i> Süresi Dolmuş
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/discounts/by-dealer")}
            >
              <i className="fa fa-store me-1"></i> Bayilere Göre
            </button>
          </div>
        </div>

        {/* Arama kutusu */}
        <div className="row">
          <div className="col-12">
            <div className="input-group input-group-lg shadow-sm rounded input-group input-group-sm filter-search flex-nowrap mt-2 sherah-border">
              <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input
                className="form-control sherah-wc__form-input"
                placeholder="ör. kış, bahar, kampanya..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {q.trim().length > 0 && q.trim().length < 2 && (
              <div className="form-text text-danger mt-1">
                Arama için en az 2 karakter girin.
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <div className="spinner-border d-block">
              <span className="visually-hidden d-block">Yükleniyor</span>
            </div>
          </div>
        ) : hasRows ? (
          <>
            <table className="sherah-table__main sherah-table__main-v3 d-block overflow-y-scrolls">
              <thead className="sherah-table__head">
                <tr>
                  <th>Ad</th>
                  <th>Açıklama</th>
                  <th>Tip</th>
                  <th>Değer</th>
                  <th>Ürünler</th>
                  <th>Bayiler</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody className="sherah-table__body">
                {pageData!.content.map((d) => {
                  const passive = isPassive(d);
                  return (
                    <tr
                      key={d.id}
                      className={passive ? "table-secondary" : undefined}
                    >
                      <td>
                        {" "}
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">{d.name}</p>
                        </div>
                      </td>
                      <td>
                        {" "}
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {d.description ?? "-"}
                          </p>
                        </div>
                      </td>
                      <td>
                        {" "}
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {d.discountType}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {" "}
                            {d.discountType === "PERCENTAGE"
                              ? `%${d.discountValue}`
                              : `${d.discountValue} ₺`}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          {d.applicableProducts?.length ? (
                            <PopoverBadgeProduct items={d.applicableProducts} />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          {d.applicableDealers?.length ? (
                            <PopoverBadgeDealer items={d.applicableDealers} />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {d.startDate
                              ? new Date(d.startDate).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {d.endDate
                              ? new Date(d.endDate).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="sherah-table__product-content">
                          <p className="sherah-table__product-desc">
                            {statusBadge(d.status)}
                          </p>
                        </div>
                      </td>
                      <td className="">
                        <div className="d-flex gap-1 flex-nowrap">
                          <button
                            className="sherah-table__action sherah-color3 sherah-color3__bg--opactit border-0"
                            onClick={() => setEditTarget(d)}
                            title="Güncelle"
                          >
                            <i className="fa-regular fa-pen-to-square" />
                          </button>

                          {/* SİL: modal aç (sadece aktiflerde) */}
                          {!passive && (
                            <button
                              className="sherah-table__action sherah-color2 sherah-color2__bg--offset border-0"
                              onClick={() => setDeleteTarget(d)}
                              title="Sil"
                            >
                              <i className="fa-regular fa-trash-can" />
                            </button>
                          )}

                          {/* RESTORE: sadece pasiflerde */}
                          {passive && (
                            <button
                              className="sherah-table__action sherah-color3 sherah-color3__bg--opactity border-0"
                              onClick={() => handleRestore(d.id)}
                              title="Geri Yükle"
                            >
                              <i className="fa-solid fa-rotate-left" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Basit sayfalama */}
            {/* Pagination (RolesList ile aynı yapı) */}
            <div className="row align-items-center mt-3">
              <div className="col-sm-12 col-md-5">
                Toplam <strong>{pageData?.totalElements ?? 0}</strong> kayıt •
                Sayfa {(pageData?.number ?? 0) + 1} /{" "}
                {pageData?.totalPages ?? 1}
              </div>
              <div className="col-sm-12 col-md-7">
                <div className="dataTables_paginate paging_simple_numbers">
                  <ul className="pagination">
                    {/* Önceki */}
                    <li
                      className={`paginate_button page-item previous ${
                        pageData?.first ? "disabled" : ""
                      }`}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!pageData?.first) prevPage();
                        }}
                      >
                        <i className="fas fa-angle-left" />
                      </a>
                    </li>

                    {/* Sayfa numaraları */}
                    {Array.from(
                      { length: pageData?.totalPages ?? 1 },
                      (_, i) => (
                        <li
                          key={i}
                          className={`paginate_button page-item ${
                            i === (pageData?.number ?? 0) ? "active" : ""
                          }`}
                        >
                          <a
                            href="#"
                            className="page-link"
                            onClick={(e) => {
                              e.preventDefault();
                              loadData(i);
                            }}
                          >
                            {i + 1}
                          </a>
                        </li>
                      )
                    )}

                    {/* Sonraki */}
                    <li
                      className={`paginate_button page-item next ${
                        pageData?.last ? "disabled" : ""
                      }`}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!pageData?.last) nextPage();
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
        ) : (
          <div className="alert alert-info">Henüz indirim bulunamadı.</div>
        )}

        {/* Modals */}
        {editTarget && (
          <EditDiscountModal
            target={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              setEditTarget(null);
              loadData(page);
            }}
          />
        )}

        {deleteTarget && (
          <DeleteDiscountModal
            target={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={() => {
              setDeleteTarget(null);
              loadData(page);
            }}
          />
        )}
      </div>
    </div>
  );
}
