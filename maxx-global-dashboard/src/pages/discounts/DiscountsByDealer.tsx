// src/pages/discounts/DiscountsByDealer.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscountsByDealer } from "../../services/discounts/list-by-dealer";
import { listSimpleDealers } from "../../services/dealers/simple";
import { listUpcomingDiscounts } from "../../services/discounts/upcoming";
import type { Discount } from "../../types/discount";
import type { DealerSummary } from "../../types/dealer";
import EditDiscountModal from "./components/EditDiscountModal";
import PopoverBadgeProduct from "../../components/popover/PopoverBadgeProduct";

// helpers
function dedupeById<T extends { id: number }>(arr: T[]): T[] {
  const m = new Map<number, T>();
  for (const x of arr) m.set(x.id, x);
  return Array.from(m.values());
}

export default function DiscountsByDealer() {
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);

  const [dealerId, setDealerId] = useState<string>("");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Discount[]>([]);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const dealers = await listSimpleDealers();
        dealers.sort((a, b) => a.name.localeCompare(b.name));
        setDealerOpts(dealers);
      } catch {
        Swal.fire("Hata", "Bayi listesi yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    await reloadList();
  }

  async function reloadList() {
    const did = Number(dealerId);
    if (!Number.isFinite(did) || did <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir bayi seçiniz.", "warning");
      return;
    }
    try {
      setLoading(true);

      const active = await listDiscountsByDealer(did);

      let merged = active;
      if (includeUpcoming) {
        const upcomingAll = await listUpcomingDiscounts();
        const upcomingFiltered = (upcomingAll ?? []).filter(
          (d) =>
            Array.isArray(d.applicableDealers) &&
            d.applicableDealers.some((x) => x.id === did)
        );
        merged = dedupeById<Discount>([...active, ...upcomingFiltered]);
      }

      setRows(merged);

      if (!merged?.length) {
        await Swal.fire(
          "Bilgi",
          includeUpcoming
            ? "Bu bayi için aktif ya da yaklaşan indirim bulunamadı."
            : "Bu bayi için şu anda geçerli indirim bulunamadı.",
          "info"
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "İndirimler getirilemedi";
      await Swal.fire("Hata", msg, "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

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
          <div className="col-md-6">
            <h3 className="sherah-card__title m-0 fw-bold">
              Bayiye Uygulanabilir İndirimler
            </h3>
          </div>
          <div className="col-md-6 d-flex flex-wrap justify-content-md-end gap-2 mt-4">
            <Link to="/discounts-list" className="sherah-btn sherah-gbcolor">
              ← İndirim Listesi
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleFetch} className="card p-3 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-8">
            <label className="form-label">Bayi *</label>
            <select
              className="form-select"
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              disabled={optsLoading}
              required
            >
              <option value="">— Bayi seçin —</option>
              {dealerOpts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 d-flex">
            <button
              style={{ height: 50 }}
              type="submit"
              className="sherah-btn sherah-btn__secondary"
              disabled={optsLoading || loading || !dealerId}
            >
              {loading ? "Yükleniyor..." : "Getir"}
            </button>
          </div>

          <div className="col-12">
            <div className="form-check mt-2">
              <input
                id="incUpcomingDealer"
                className="form-check-input"
                type="checkbox"
                checked={includeUpcoming}
                onChange={(e) => setIncludeUpcoming(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="incUpcomingDealer">
                Yaklaşan indirimleri de göster
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Tablo */}
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
                <th>Ürünler</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
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
                  <td>{d.discountType}</td>
                  <td>
                    {d.discountType === "PERCENTAGE"
                      ? `%${d.discountValue}`
                      : `${d.discountValue} ₺`}
                  </td>
                  <td>
                    {d.applicableProducts?.length ? (
                      <PopoverBadgeProduct
                        items={d.applicableProducts}
                        badgeType="product"
                      />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {d.startDate ? new Date(d.startDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                  </td>
                  <td>{statusBadge(d.status)}</td>
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
            Toplam: <strong>{rows.length}</strong> indirim.
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          Sonuç yok. Bayi seçip “Getir”e tıklayın.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editTarget && (
        <EditDiscountModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            if (dealerId) {
              reloadList();
            }
          }}
        />
      )}
    </div>
  );
}
