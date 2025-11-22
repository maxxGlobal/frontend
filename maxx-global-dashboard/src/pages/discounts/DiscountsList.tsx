import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscounts } from "../../services/discounts/list";
import { restoreDiscount } from "../../services/discounts/restore";
import { searchDiscounts } from "../../services/discounts/search";
import type { Discount, PageResponse } from "../../types/discount";
import EditDiscountModal from "./components/EditDiscountModal";
import DeleteDiscountModal from "./components/DeleteDiscountModal";
import PopoverBadgeVariant from "../../components/popover/PopoverBadgeVariant";
import PopoverBadgeDealer from "../../components/popover/PopoverBadgeDealer";
import PopoverBadgeProduct from "../../components/popover/PopoverBadgeProduct";

export default function DiscountsList() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Discount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const size = 30;
  const [q, setQ] = useState("");

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

    if (query.length === 0 && !didInitialFetch.current) {
      didInitialFetch.current = true;
      loadData(0);
      return;
    }

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

  const statusBadge = (discount: Discount) => {
    const passive = isPassive(discount);
    const label =
      discount.statusDescription ||
      discount.validityStatus ||
      discount.status ||
      (passive ? "PASİF" : "AKTİF");

    return passive ? (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        {label}
      </div>
    ) : (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        {label}
      </div>
    );
  };

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer mb-4">
        <div className="row align-items-center justify-content-between border-bottom pb-3 mb-3">
          <div className="col-md-8 mb-2 mb-md-0">
            <h3 className="sherah-card__title m-0 fw-bold">İndirim Listesi</h3>
          </div>

          <div className="col-md-4 d-flex flex-wrap justify-content-md-end gap-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/discounts-create")}
            >
              <i className="fa fa-plus me-1"></i> Yeni İndirim
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

      <div className="sherah-card__body">
        <div className="sherah-page-inner sherah-default-bg sherah-border">
          <div className="sherah-table p-0">
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
                      <th>Varyantlar/Kategoriler</th>
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
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.name}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.description ?? "-"}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.discountType}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.discountType === "PERCENTAGE"
                                ? `%${d.discountValue}`
                                : `${d.discountValue} ₺`}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content">
                              {/* ✅ YENİ - Variant desteği */}
                              {d.applicableVariants &&
                              d.applicableVariants.length > 0 ? (
                                <PopoverBadgeVariant
                                  items={d.applicableVariants}
                                />
                              ) : d.applicableCategories &&
                                d.applicableCategories.length > 0 ? (
                                <PopoverBadgeProduct
                                  items={d.applicableCategories}
                                  badgeType="category"
                                />
                              ) : (
                                <span className="badge bg-secondary">
                                  Genel
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content">
                              {d.applicableDealers?.length ? (
                                <PopoverBadgeDealer
                                  items={d.applicableDealers}
                                />
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.startDate
                                ? new Date(d.startDate).toLocaleString()
                                : "-"}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {d.endDate
                                ? new Date(d.endDate).toLocaleString()
                                : "-"}
                            </div>
                          </td>

                          <td>
                            <div className="sherah-table__product-content sherah-table__product-desc">
                              {statusBadge(d)}
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

                              {!passive && (
                                <button
                                  className="sherah-table__action sherah-color2 sherah-color2__bg--offset border-0"
                                  onClick={() => setDeleteTarget(d)}
                                  title="Sil"
                                >
                                  <i className="fa-regular fa-trash-can" />
                                </button>
                              )}

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

                <div className="row align-items-center mt-3">
                  <div className="col-sm-12 col-md-5">
                    Toplam <strong>{pageData?.totalElements ?? 0}</strong> kayıt
                    • Sayfa {(pageData?.number ?? 0) + 1} /{" "}
                    {pageData?.totalPages ?? 1}
                  </div>
                  <div className="col-sm-12 col-md-7">
                    <div className="dataTables_paginate paging_simple_numbers">
                      <ul className="pagination">
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
      </div>
    </div>
  );
}