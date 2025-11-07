import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { listExpiredDiscounts } from "../../services/discounts/expired";
import type { Discount } from "../../types/discount";
import EditDiscountModal from "./components/EditDiscountModal";
import PopoverBadgeVariant from "../../components/popover/PopoverBadgeVariant";
import PopoverBadgeProduct from "../../components/popover/PopoverBadgeProduct";
import PopoverBadgeDealer from "../../components/popover/PopoverBadgeDealer";

// helpers
function formatTimeSince(endIso?: string) {
  if (!endIso) return "-";
  const ms = Date.now() - new Date(endIso).getTime();
  if (ms <= 0) return "Bitiş saati gelmedi";
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}g ${hours}s ${mins}dk önce`;
  if (hours > 0) return `${hours}s ${mins}dk önce`;
  return `${mins}dk önce`;
}

export default function DiscountsExpired() {
  const [rows, setRows] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  const [editTarget, setEditTarget] = useState<Discount | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await listExpiredDiscounts();
      setRows(data);
    } catch (e) {
      Swal.fire("Hata", "Süresi dolan indirimler yüklenemedi", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const hasRows = rows.length > 0;
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
        <div className="row align-items-center border-bottom pb-3 mb-3">
          <div className="col-md-6 mb-2 mb-md-0">
            <h3 className="sherah-card__title m-0 fw-bold">
              Süresi Dolmuş İndirimler
            </h3>
          </div>
          <div className="col-md-6 d-flex flex-wrap justify-content-md-end gap-2 mt-4">
            <Link to="/discounts-list" className="sherah-btn sherah-gbcolor">
              ← İndirim Listesi
            </Link>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
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
                  <th>Bitiş Süresi</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody className="sherah-table__body">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="sherah-table__product-content">
                        <p className="sherah-table__product-desc">{d.name}</p>
                      </div>
                    </td>
                    <td>
                      <div className="sherah-table__product-content">
                        <p className="sherah-table__product-desc">
                          {d.description ?? "-"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="sherah-table__product-content">
                        <p className="sherah-table__product-desc">
                          {d.discountType}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="sherah-table__product-content">
                        <p className="sherah-table__product-desc">
                          {d.discountType === "PERCENTAGE"
                            ? `%${d.discountValue}`
                            : `${d.discountValue} ₺`}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="sherah-table__product-content">
                        {/* ✅ YENİ - Variant desteği */}
                        {d.applicableVariants && d.applicableVariants.length > 0 ? (
                          <PopoverBadgeVariant items={d.applicableVariants} />
                        ) : d.applicableCategories && d.applicableCategories.length > 0 ? (
                          <PopoverBadgeProduct
                            items={d.applicableCategories}
                            badgeType="category"
                          />
                        ) : (
                          <span className="badge bg-secondary">Genel</span>
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
                      <span className="badge bg-secondary">
                        {formatTimeSince(d.endDate)}
                      </span>
                    </td>
                    <td>
                      <div className="sherah-table__product-content">
                        <p className="sherah-table__product-desc">
                          {statusBadge(d.status)}
                        </p>
                      </div>
                    </td>
                    <td className="d-flex gap-1 flex-nowrap">
                      <button
                        className="sherah-table__action sherah-color3 sherah-color3__bg--opactit border-0"
                        onClick={() => setEditTarget(d)}
                        title="Güncelle"
                      >
                        <i className="fa-regular fa-pen-to-square" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-muted mt-3">
              Toplam: <strong>{rows.length}</strong> kayıt.
            </div>
          </>
        ) : (
          <div className="alert alert-info">
            Süresi dolmuş indirim bulunamadı.
          </div>
        )}

        {editTarget && (
          <EditDiscountModal
            target={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              setEditTarget(null);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
}