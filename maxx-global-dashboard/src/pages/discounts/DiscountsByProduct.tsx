// src/pages/discounts/DiscountsByProduct.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { listDiscountsByProduct } from "../../services/discounts/list-by-product";
import { listSimpleProducts } from "../../services/products/simple";
import { listSimpleDealers } from "../../services/dealers/simple";
import { listUpcomingDiscounts } from "../../services/discounts/upcoming";
import type { Discount } from "../../types/discount";
import type { ProductSimple } from "../../types/product";
import type { DealerSummary } from "../../types/dealer";
import PopoverBadgeDealer from "../../components/popover/PopoverBadgeDealer";

function dedupeById<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map<number, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
}

export default function DiscountsByProduct() {
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);

  const [productId, setProductId] = useState<string>("");
  const [dealerId, setDealerId] = useState<string>("");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Discount[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setOptsLoading(true);
        const [prods, dealers] = await Promise.all([
          listSimpleProducts(),
          listSimpleDealers(),
        ]);
        prods.sort((a, b) => a.name.localeCompare(b.name));
        dealers.sort((a, b) => a.name.localeCompare(b.name));
        setProductOpts(prods);
        setDealerOpts(dealers);
      } catch {
        Swal.fire("Hata", "Seçim listeleri yüklenemedi", "error");
      } finally {
        setOptsLoading(false);
      }
    })();
  }, []);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    const pid = Number(productId);
    const did = dealerId.trim() ? Number(dealerId) : undefined;

    if (!Number.isFinite(pid) || pid <= 0) {
      await Swal.fire("Uyarı", "Lütfen bir ürün seçiniz.", "warning");
      return;
    }

    try {
      setLoading(true);

      const active = await listDiscountsByProduct(pid, did);

      let merged = active;
      if (includeUpcoming) {
        const upcomingAll = await listUpcomingDiscounts();
        const upcomingFiltered = (upcomingAll ?? []).filter((d) => {
          const okProduct = Array.isArray(d.applicableProducts)
            ? d.applicableProducts.some((p) => p.id === pid)
            : false;
          const okDealer = did
            ? Array.isArray(d.applicableDealers) &&
              d.applicableDealers.some((x) => x.id === did)
            : true;
          return okProduct && okDealer;
        });
        merged = dedupeById<Discount>([...active, ...upcomingFiltered]);
      }

      setRows(merged);

      if (!merged?.length) {
        await Swal.fire(
          "Bilgi",
          includeUpcoming
            ? "Bu ürün için aktif ya da yaklaşan indirim bulunamadı."
            : "Bu ürün için şu anda geçerli indirim bulunamadı.",
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
              Ürüne Göre İndirimler
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
          <div className="col-md-6">
            <label className="form-label">Ürün *</label>
            <select
              className="form-select"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={optsLoading}
              required
            >
              <option value="">— Ürün seçin —</option>
              {productOpts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.code ? ` (${p.code})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Bayi (opsiyonel)</label>
            <select
              className="form-select"
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              disabled={optsLoading}
            >
              <option value="">— Tümü —</option>
              {dealerOpts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 d-flex">
            <button
              style={{ height: 50 }}
              type="submit"
              className="sherah-btn sherah-btn__secondary"
              disabled={optsLoading || loading || !productId}
            >
              {loading ? "Yükleniyor..." : "Getir"}
            </button>
          </div>
          <div className="col-12">
            <div className="form-check mt-2">
              <input
                id="incUpcoming"
                className="form-check-input"
                type="checkbox"
                checked={includeUpcoming}
                onChange={(e) => setIncludeUpcoming(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="incUpcoming">
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
                <th>Tip</th>
                <th>Değer</th>
                <th>Bayiler</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
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
                  <td>{d.discountType}</td>
                  <td>
                    {d.discountType === "PERCENTAGE"
                      ? `%${d.discountValue}`
                      : `${d.discountValue} ₺`}
                  </td>
                  <td>
                    {d.applicableDealers?.length ? (
                      <PopoverBadgeDealer items={d.applicableDealers} />
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
                  <td> {statusBadge(d.status)}</td>
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
          Sonuç yok. Ürün seçip “Getir”e tıklayın.
        </div>
      )}
    </div>
  );
}
