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

// helpers
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
        <span key={i} className="badge bg-info text-dark">
          {n}
        </span>
      ))}
      {rest.length > 0 && (
        <span className="badge bg-secondary" title={restTitle}>
          +{rest.length}
        </span>
      )}
    </div>
  );
}
function dedupeById<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map<number, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
}
function statusBadge(d: Discount) {
  const now = Date.now();
  const start = d.startDate ? new Date(d.startDate).getTime() : 0;
  const end = d.endDate ? new Date(d.endDate).getTime() : 0;

  if (d.isValidNow || (start <= now && now <= end)) {
    return <span className="badge bg-success">AKTİF</span>;
  }
  if (start > now) {
    return <span className="badge bg-warning text-dark">YAKLAŞAN</span>;
  }
  return (
    <span className="badge bg-secondary">{d.isActive ? "PASİF" : "PASİF"}</span>
  );
}

export default function DiscountsByProduct() {
  // dropdown seçenekleri
  const [productOpts, setProductOpts] = useState<ProductSimple[]>([]);
  const [dealerOpts, setDealerOpts] = useState<DealerSummary[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);

  // seçimler
  const [productId, setProductId] = useState<string>("");
  const [dealerId, setDealerId] = useState<string>("");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(true); // 👈 yeni

  // sonuçlar
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Discount[]>([]);

  // dropdown verileri
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

      // 1) ŞU AN GEÇERLİ indirimler
      const active = await listDiscountsByProduct(pid, did);

      // 2) Yaklaşanları dahil et (opsiyonel)
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

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Ürüne Göre İndirimler</h2>
        <div className="d-flex gap-2">
          <Link to="/discounts" className="btn btn-secondary">
            ← İndirim Listesi
          </Link>
          <Link to="/discounts/upcoming" className="btn btn-outline-primary">
            Yaklaşan İndirimler
          </Link>
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
              type="submit"
              className="btn btn-primary w-100"
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
            <div className="form-text">
              Not: “Getir”, şu an geçerli indirimleri arar. Bu kutu işaretliyse,
              ürünü kapsayan yaklaşan indirimler de eklenir.
            </div>
          </div>
        </div>
      </form>

      {/* Sonuç Tablosu */}
      {loading ? (
        <div className="text-center">Yükleniyor...</div>
      ) : hasRows ? (
        <>
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
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
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.discountType}</td>
                  <td>
                    {d.discountType === "PERCENTAGE"
                      ? `%${d.discountValue}`
                      : `${d.discountValue} ₺`}
                  </td>
                  <td style={{ minWidth: 160 }}>
                    {renderBadges(d.applicableDealers, 3)}
                  </td>
                  <td>
                    {d.startDate ? new Date(d.startDate).toLocaleString() : "-"}
                  </td>
                  <td>
                    {d.endDate ? new Date(d.endDate).toLocaleString() : "-"}
                  </td>
                  <td>{statusBadge(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-muted">
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
